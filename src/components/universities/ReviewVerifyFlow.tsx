"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileUp, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  classifyEmailDomain,
  getEmailDomain,
  isValidEmail,
  type EmailDomainKind,
} from "@/lib/review-email-verify";
import {
  ALL_STATES_NAME,
  type InstitutionListItem,
} from "@/lib/institutions-types";

import "@/styles/university-detail.css";

type Visibility = "anonymous" | "public";
type VerifyStep =
  | "visibility"
  | "email"
  | "otp"
  | "name"
  | "college"
  | "document"
  | "done";

type DocType = "degree" | "identity" | "certificate" | "other";

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "degree", label: "Degree" },
  { value: "identity", label: "Identity proof" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
];

interface ReviewVerifyFlowProps {
  institutionName: string;
  onComplete: () => void;
}

export function ReviewVerifyFlow({
  institutionName,
  onComplete,
}: ReviewVerifyFlowProps) {
  const [step, setStep] = useState<VerifyStep>("visibility");
  const [visibility, setVisibility] = useState<Visibility | "">("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [domainKind, setDomainKind] = useState<EmailDomainKind>("unknown");
  const [displayName, setDisplayName] = useState("");
  const [collegeMode, setCollegeMode] = useState<"listed" | "custom">("listed");
  const [collegeQuery, setCollegeQuery] = useState("");
  const [collegeResults, setCollegeResults] = useState<InstitutionListItem[]>(
    []
  );
  const [selectedCollege, setSelectedCollege] =
    useState<InstitutionListItem | null>(null);
  const [customCollege, setCustomCollege] = useState("");
  const [isSearchingColleges, setIsSearchingColleges] = useState(false);
  const [docType, setDocType] = useState<DocType | "">("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRequest = useRef(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (step !== "college" || collegeMode !== "listed") return;
    const q = collegeQuery.trim();
    if (q.length < 2) {
      setCollegeResults([]);
      return;
    }

    const current = ++searchRequest.current;
    const timer = window.setTimeout(async () => {
      setIsSearchingColleges(true);
      try {
        const params = new URLSearchParams({
          q,
          state: ALL_STATES_NAME,
          page: "1",
          limit: "8",
        });
        const res = await fetch(`/api/institutions/search?${params}`);
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { results: InstitutionListItem[] };
        if (current !== searchRequest.current) return;
        setCollegeResults(data.results);
      } catch {
        if (current === searchRequest.current) setCollegeResults([]);
      } finally {
        if (current === searchRequest.current) setIsSearchingColleges(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [collegeQuery, collegeMode, step]);

  const domain = useMemo(() => getEmailDomain(email), [email]);

  function continueAfterOtp(kind: EmailDomainKind) {
    setDomainKind(kind);
    if (kind === "institutional") {
      setStep("name");
      return;
    }
    // Personal / unknown domain → college confirmation + documents
    setCollegeQuery(institutionName);
    setCollegeMode("listed");
    setStep("college");
  }

  function chooseVisibility(next: Visibility) {
    setVisibility(next);
    setStep("email");
  }

  function handleSendOtp() {
    if (!isValidEmail(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setEmail(email.trim());
      setOtp("");
      setResendCooldown(60);
      setBusy(false);
      setStep("otp");
      toast.message("OTP sent (demo)", {
        description: "No email is sent in this preview. Enter any 6-digit code.",
      });
    }, 500);
  }

  function handleVerifyOtp() {
    if (otp.trim().length !== 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      continueAfterOtp(classifyEmailDomain(email));
    }, 400);
  }

  function handleNameContinue() {
    if (!displayName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    finish();
  }

  function handleCollegeContinue() {
    if (collegeMode === "listed") {
      if (!selectedCollege) {
        toast.error("Select a college from the list, or choose “College not listed”.");
        return;
      }
    } else if (!customCollege.trim()) {
      toast.error("Please type your college name.");
      return;
    }
    setStep("document");
  }

  function handleDocumentSubmit() {
    if (!docType) {
      toast.error("Please select a document type.");
      return;
    }
    if (!docFile) {
      toast.error("Please upload a document.");
      return;
    }
    finish();
  }

  function finish() {
    setStep("done");
    window.setTimeout(() => {
      toast.success(
        visibility === "anonymous"
          ? "Review submitted anonymously. (UI demo — not saved yet.)"
          : "Review submitted with your details. (UI demo — not saved yet.)"
      );
      onComplete();
    }, 700);
  }

  const stepTitle: Record<VerifyStep, string> = {
    visibility: "How should we post this?",
    email: "Verify with email",
    otp: "Enter verification code",
    name: "Almost done",
    college: "Confirm your college",
    document: "Upload a document",
    done: "Submitted",
  };

  const stepHint: Record<VerifyStep, string> = {
    visibility:
      "Choose whether this review appears anonymously or with your details on the review page.",
    email:
      "We’ll email a one-time code. Prefer your college email so we can verify affiliation faster.",
    otp: `We sent a 6-digit code to ${email}.`,
    name:
      domainKind === "institutional"
        ? `Your email domain (${domain}) looks like a college address. Confirm your name next.`
        : "Confirm your name for this review.",
    college:
      "Your email isn’t linked to a known college domain in our database. Select your college, or type it if it isn’t listed — then we’ll ask for a document.",
    document:
      "Upload a degree, ID proof, certificate, or other document so we can verify which college you’re associated with.",
    done: "Thanks — your review is in.",
  };

  return (
    <div className="review-verify" aria-label="Review verification">
      <header className="review-verify__header">
        <h3 className="review-verify__title">{stepTitle[step]}</h3>
        <p className="review-verify__hint">{stepHint[step]}</p>
      </header>

      {step === "visibility" && (
        <div className="review-verify__body">
          <div className="review-tiles" data-columns="2" role="radiogroup">
            <label
              className={`review-tile${visibility === "anonymous" ? " review-tile--active" : ""}`}
            >
              <input
                type="radio"
                name="visibility"
                checked={visibility === "anonymous"}
                onChange={() => chooseVisibility("anonymous")}
              />
              <span>Post anonymously</span>
            </label>
            <label
              className={`review-tile${visibility === "public" ? " review-tile--active" : ""}`}
            >
              <input
                type="radio"
                name="visibility"
                checked={visibility === "public"}
                onChange={() => chooseVisibility("public")}
              />
              <span>Show my details</span>
            </label>
          </div>
          <p className="college-review-form__hint">
            Anonymous reviews still need email verification so we can prevent
            spam — your email isn’t shown publicly.
          </p>
        </div>
      )}

      {step === "email" && (
        <div className="review-verify__body">
          <div className="college-review-form__field">
            <Label htmlFor="verify-email" className="college-review-form__question">
              Email
            </Label>
            <Input
              id="verify-email"
              type="email"
              className="college-review-form__input"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
            <p className="college-review-form__hint">
              Prefer your college email so we can verify which college you’re
              from more easily. Personal email works too — we may ask for a
              document next.
            </p>
          </div>
          <div className="review-verify__actions">
            <Button type="button" variant="outline" onClick={() => setStep("visibility")}>
              Back
            </Button>
            <Button type="button" onClick={handleSendOtp} disabled={busy}>
              {busy ? "Sending…" : "Send OTP"}
            </Button>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div className="review-verify__body">
          <div className="college-review-form__field">
            <Label className="college-review-form__question">One-time code</Label>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup className="review-verify__otp">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="college-review-form__hint">
              Demo mode: any 6-digit code works.{" "}
              <button
                type="button"
                className="review-verify__link"
                disabled={resendCooldown > 0 || busy}
                onClick={() => {
                  setResendCooldown(60);
                  toast.message("OTP resent (demo)");
                }}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </button>
            </p>
          </div>
          <div className="review-verify__actions">
            <Button type="button" variant="outline" onClick={() => setStep("email")}>
              Change email
            </Button>
            <Button type="button" onClick={handleVerifyOtp} disabled={busy}>
              {busy ? "Verifying…" : "Verify email"}
            </Button>
          </div>
        </div>
      )}

      {step === "name" && (
        <div className="review-verify__body">
          <div className="review-verify__match">
            College email matched for{" "}
            <strong>{institutionName}</strong>
          </div>
          <div className="college-review-form__field">
            <Label htmlFor="verify-name" className="college-review-form__question">
              Your name
              {visibility === "public" ? (
                <span className="review-criteria__required">*</span>
              ) : null}
            </Label>
            <Input
              id="verify-name"
              className="college-review-form__input"
              placeholder="Full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              autoFocus
            />
            <p className="college-review-form__hint">
              {visibility === "public"
                ? "This name can appear with your review on the website."
                : "Used for verification only — it won’t be shown publicly on anonymous reviews."}
            </p>
          </div>
          <div className="review-verify__actions">
            <Button type="button" variant="outline" onClick={() => setStep("otp")}>
              Back
            </Button>
            <Button type="button" onClick={handleNameContinue}>
              Submit review
            </Button>
          </div>
        </div>
      )}

      {step === "college" && (
        <div className="review-verify__body">
          <div className="review-tiles" data-columns="2" role="radiogroup">
            <label
              className={`review-tile${collegeMode === "listed" ? " review-tile--active" : ""}`}
            >
              <input
                type="radio"
                name="college-mode"
                checked={collegeMode === "listed"}
                onChange={() => {
                  setCollegeMode("listed");
                  setCustomCollege("");
                }}
              />
              <span>Select college</span>
            </label>
            <label
              className={`review-tile${collegeMode === "custom" ? " review-tile--active" : ""}`}
            >
              <input
                type="radio"
                name="college-mode"
                checked={collegeMode === "custom"}
                onChange={() => {
                  setCollegeMode("custom");
                  setSelectedCollege(null);
                }}
              />
              <span>College not listed</span>
            </label>
          </div>

          {collegeMode === "listed" ? (
            <div className="college-review-form__field">
              <Label
                htmlFor="college-search"
                className="college-review-form__question"
              >
                Search college
              </Label>
              <div className="review-verify__search">
                <Search aria-hidden />
                <Input
                  id="college-search"
                  className="college-review-form__input"
                  placeholder="College name…"
                  value={collegeQuery}
                  onChange={(e) => {
                    setCollegeQuery(e.target.value);
                    setSelectedCollege(null);
                  }}
                />
              </div>
              {isSearchingColleges && (
                <p className="college-review-form__hint">Searching…</p>
              )}
              {collegeResults.length > 0 && (
                <ul className="review-verify__college-list" role="listbox">
                  {collegeResults.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`review-verify__college-option${
                          selectedCollege?.id === item.id
                            ? " review-verify__college-option--active"
                            : ""
                        }`}
                        onClick={() => setSelectedCollege(item)}
                      >
                        <span className="review-verify__college-name">
                          {item.name}
                        </span>
                        <span className="review-verify__college-meta">
                          {[item.city || item.district, item.state]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedCollege && (
                <p className="college-review-form__hint">
                  Selected: <strong>{selectedCollege.name}</strong>
                </p>
              )}
            </div>
          ) : (
            <div className="college-review-form__field">
              <Label
                htmlFor="custom-college"
                className="college-review-form__question"
              >
                College name
                <span className="review-criteria__required">*</span>
              </Label>
              <Input
                id="custom-college"
                className="college-review-form__input"
                placeholder="Type the full college name"
                value={customCollege}
                onChange={(e) => setCustomCollege(e.target.value)}
              />
              <p className="college-review-form__hint">
                We’ll use your document to verify this name and email domain.
              </p>
            </div>
          )}

          <div className="review-verify__actions">
            <Button type="button" variant="outline" onClick={() => setStep("otp")}>
              Back
            </Button>
            <Button type="button" onClick={handleCollegeContinue}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "document" && (
        <div className="review-verify__body">
          <h4 className="review-verify__section-title">
            Can you please upload a document so we can verify which college you
            are from?
          </h4>

          <div className="college-review-form__field">
            <Label className="college-review-form__question">
              Document type
              <span className="review-criteria__required">*</span>
            </Label>
            <Select
              value={docType}
              onValueChange={(value) => setDocType((value as DocType) ?? "")}
            >
              <SelectTrigger className="college-review-form__select" size="default">
                <SelectValue placeholder="Select document type">
                  {docType
                    ? (DOC_TYPES.find((d) => d.value === docType)?.label ?? null)
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="college-review-form__field">
            <Label className="college-review-form__question">
              Upload file
              <span className="review-criteria__required">*</span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              className="sr-only"
              onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="review-verify__upload"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp aria-hidden />
              <span>
                {docFile
                  ? docFile.name
                  : "Upload PDF or image (max demo size unlimited)"}
              </span>
            </button>
            <p className="college-review-form__hint">
              Accepted: PDF or image. Used only for affiliation verification.
            </p>
          </div>

          <div className="review-verify__actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("college")}
            >
              Back
            </Button>
            <Button type="button" onClick={handleDocumentSubmit}>
              Submit for verification
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="review-verify__body review-verify__body--done">
          <p className="review-verify__done-copy">
            Your review is being finalized…
          </p>
        </div>
      )}
    </div>
  );
}
