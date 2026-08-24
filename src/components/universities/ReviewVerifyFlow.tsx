"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { toast } from "sonner";

import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ReviewSubmitPayload,
  ReviewVerificationMethod,
} from "@/lib/review-types";
import {
  REVIEW_DOCUMENT_ACCEPT,
  REVIEW_DOCUMENT_MAX_BYTES,
  formatBytes,
  validateReviewDocument,
} from "@/lib/review-document";

import "@/styles/university-detail.css";

type VerifyStep =
  | "choose"
  | "linkedin-login"
  | "email-enter"
  | "email-otp"
  | "identity"
  | "send"
  | "method"
  | "document"
  | "done";

type VerifyPath = "linkedin" | "custom";

type AffiliationChoice = "email" | "document" | "skipped";

type DocType = "degree" | "identity" | "certificate" | "other";

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "degree", label: "Degree" },
  { value: "identity", label: "Identity proof" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
];

interface ReviewVerifyFlowProps {
  institutionName: string;
  fullyAnonymous?: boolean;
  reviewDraft: Omit<ReviewSubmitPayload, "verification">;
  onComplete: () => void;
}

export function ReviewVerifyFlow({
  institutionName,
  fullyAnonymous = true,
  reviewDraft,
  onComplete,
}: ReviewVerifyFlowProps) {
  const [step, setStep] = useState<VerifyStep>("choose");
  const [verifyPath, setVerifyPath] = useState<VerifyPath | null>(null);
  const [affiliationChoice, setAffiliationChoice] =
    useState<AffiliationChoice | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [docType, setDocType] = useState<DocType | "">("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [submittedUnverified, setSubmittedUnverified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkedinIntentRef = useRef(false);

  useEffect(() => {
    // Refresh / remount must not keep a prior OAuth / email session.
    void fetch("/api/auth/linkedin/session", {
      method: "DELETE",
      credentials: "same-origin",
    });
    void fetch("/api/auth/email/verify", {
      method: "DELETE",
      credentials: "same-origin",
    });
    setLinkedinConnected(false);
    setEmailVerified(false);
    setDisplayName("");
    setEmail("");
    setOtp("");
    setAffiliationChoice(null);
    setSubmittedUnverified(false);
    setStep("choose");
    setVerifyPath(null);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        type?: string;
        ok?: boolean;
        message?: string;
      };

      if (data?.type !== "linkedin-auth") return;

      setBusy(false);
      if (!data.ok) {
        linkedinIntentRef.current = false;
        toast.error(data.message || "LinkedIn connection failed.");
        setStep("choose");
        return;
      }

      void (async () => {
        try {
          const res = await fetch("/api/auth/linkedin/session", {
            credentials: "same-origin",
          });
          if (!res.ok) {
            toast.error(
              "LinkedIn connected, but we could not load your profile."
            );
            setStep("choose");
            return;
          }
          const session = (await res.json()) as { name?: string };
          const name = session.name?.trim() ?? "";
          setLinkedinConnected(true);
          setVerifyPath("linkedin");
          if (name) setDisplayName(name);
          toast.success("LinkedIn connected");
          linkedinIntentRef.current = false;
          setStep("identity");
        } catch {
          toast.error(
            "LinkedIn connected, but we could not load your profile."
          );
          setStep("choose");
        }
      })();
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function submitReview(
    method: ReviewVerificationMethod,
    documentMeta?: {
      documentUrl?: string;
      documentFilename?: string;
      documentSize?: number;
    }
  ) {
    if (!displayName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setBusy(true);
    try {
      const payload: ReviewSubmitPayload = {
        ...reviewDraft,
        verification: {
          method,
          displayName: displayName.trim(),
          collegeEmail:
            method === "email"
              ? email.trim() || undefined
              : undefined,
          documentType:
            method === "document" && docType ? docType : undefined,
          documentFilename:
            method === "document"
              ? documentMeta?.documentFilename ?? docFile?.name
              : undefined,
          documentSize:
            method === "document"
              ? documentMeta?.documentSize ?? docFile?.size
              : undefined,
          documentUrl:
            method === "document" ? documentMeta?.documentUrl : undefined,
        },
      };

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Failed to save review");
      }

      setSubmittedUnverified(method === "skipped");
      setStep("done");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save review"
      );
    } finally {
      setBusy(false);
    }
  }

  function openOAuthPopup(path: string, windowName: string) {
    const width = 520;
    const height = 700;
    const left = Math.max(
      0,
      Math.round(window.screenX + (window.outerWidth - width) / 2)
    );
    const top = Math.max(
      0,
      Math.round(window.screenY + (window.outerHeight - height) / 2)
    );
    return window.open(
      path,
      windowName,
      `width=${width},height=${height},left=${left},top=${top},popup=yes`
    );
  }

  function handleContinueWithLinkedIn() {
    setVerifyPath("linkedin");
    setLinkedinConnected(false);
    setEmailVerified(false);
    setDisplayName("");
    setStep("linkedin-login");
    linkedinIntentRef.current = true;
    setBusy(true);

    const popup = openOAuthPopup("/api/auth/linkedin", "linkedin-oauth");
    if (!popup) {
      setBusy(false);
      linkedinIntentRef.current = false;
      setStep("choose");
      toast.error("Allow popups for this site to sign in with LinkedIn.");
      return;
    }

    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer);
        setBusy(false);
        if (linkedinIntentRef.current) {
          linkedinIntentRef.current = false;
          setStep((current) =>
            current === "linkedin-login" ? "choose" : current
          );
        }
      }
    }, 500);
  }

  function handleCollegeEmail() {
    setVerifyPath("custom");
    setAffiliationChoice("email");
    setEmailVerified(false);
    setLinkedinConnected(false);
    setDisplayName("");
    setOtp("");
    setStep("email-enter");
  }

  async function sendEmailOtp(targetEmail: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        email?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Failed to send code");
      }
      if (data.email) setEmail(data.email);
      setOtp("");
      setResendCooldown(60);
      setStep("email-otp");
      toast.success("Verification code sent");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send code"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSendEmailCode(e?: React.FormEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    await sendEmailOtp(value);
  }

  async function handleVerifyEmailOtp(e?: React.FormEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ code: otp }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        email?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Invalid code");
      }
      if (data.email) setEmail(data.email);
      setEmailVerified(true);
      setAffiliationChoice("email");
      toast.success("Email verified");
      setStep("identity");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify code"
      );
    } finally {
      setBusy(false);
    }
  }

  function handleVerifyCustom() {
    setVerifyPath("custom");
    setLinkedinConnected(false);
    setEmailVerified(false);
    setDisplayName("");
    setAffiliationChoice(null);
    setStep("method");
  }

  function handleIdentityContinue() {
    if (!displayName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (verifyPath === "linkedin" || affiliationChoice === "email") {
      setStep("send");
      return;
    }
    if (affiliationChoice === "document") {
      setStep("document");
      return;
    }
    if (affiliationChoice === "skipped") {
      void submitReview("skipped");
      return;
    }
    setStep("method");
  }

  function resolveSendMethod(): ReviewVerificationMethod {
    if (verifyPath === "linkedin") return "linkedin";
    if (affiliationChoice === "email") return "email";
    return "linkedin";
  }

  async function handleDocumentSubmit() {
    if (!docType) {
      toast.error("Please select a document type.");
      return;
    }
    if (!docFile) {
      toast.error("Please upload a document.");
      return;
    }
    const localError = validateReviewDocument(docFile);
    if (localError) {
      toast.error(localError);
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", docFile);
      const uploadRes = await fetch("/api/reviews/document", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const uploadData = (await uploadRes.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
        filename?: string;
        size?: number;
      };
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload document");
      }

      setBusy(false);
      await submitReview("document", {
        documentUrl: uploadData.url,
        documentFilename: uploadData.filename ?? docFile.name,
        documentSize: uploadData.size ?? docFile.size,
      });
    } catch (error) {
      setBusy(false);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload document"
      );
    }
  }

  function handleDocFileChange(file: File | null) {
    if (!file) {
      setDocFile(null);
      return;
    }
    const error = validateReviewDocument(file);
    if (error) {
      toast.error(error);
      setDocFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setDocFile(file);
  }

  const nameVerified = linkedinConnected;

  const stepTitle: Record<VerifyStep, string> = {
    choose: "Let’s verify your review",
    "linkedin-login": "Connecting LinkedIn",
    "email-enter": "College email",
    "email-otp": "Enter verification code",
    identity:
      verifyPath === "linkedin"
        ? "LinkedIn profile connected"
        : affiliationChoice === "email"
          ? "Email verified"
          : "Confirm your name",
    send: "Ready to send",
    method: "Prove your college affiliation",
    document: "Upload your document",
    done: "You’re all set",
  };

  const stepHint: Record<VerifyStep, string> = {
    choose: fullyAnonymous
      ? "We won’t share your name or any personal details on the platform or with other users. Pick how you want to verify."
      : `Confirm who you are so we can keep spam out of ${institutionName}.`,
    "linkedin-login":
      "A LinkedIn window should open. Sign in there with your LinkedIn account. Allow popups if you don’t see it.",
    "email-enter":
      "Use your college email or Gmail. We’ll send a one-time code to prove you own it.",
    "email-otp": `We sent a 6-digit code to ${email}. Enter it below.`,
    identity:
      verifyPath === "linkedin"
        ? "Here’s the name from your LinkedIn profile. Edit it if it should match your college ID."
        : affiliationChoice === "email"
          ? "Add your full name as it appears on your college ID or certificate."
          : affiliationChoice === "skipped"
            ? "Add your name, then we’ll post this review as unverified (no email or document check)."
            : "Enter your full name as it appears on your college ID or certificate.",
    send: fullyAnonymous
      ? "We’ll keep your identity private. Send when you’re ready."
      : "Double-check your name, then send your review.",
    method:
      "Choose College Email or a document to prove affiliation. Skip posts without verification.",
    document: `Marksheet, ID card, or degree (JPG/PNG/WebP/PDF, max ${formatBytes(REVIEW_DOCUMENT_MAX_BYTES)}).`,
    done: fullyAnonymous
      ? "Your review was submitted anonymously. Thank you for sharing your experience."
      : "Your review was submitted. Thank you for sharing your experience.",
  };

  return (
    <div
      className={`review-verify${step === "done" ? " review-verify--success" : ""}`}
      aria-label="Review verification"
    >
      {step !== "done" ? (
        <header className="review-verify__header">
          <h3 className="review-verify__title">{stepTitle[step]}</h3>
          <p className="review-verify__hint">{stepHint[step]}</p>
        </header>
      ) : null}

      {step === "choose" && (
        <div className="review-verify__body">
          <div className="review-tiles" data-columns="1" role="group">
            <button
              type="button"
              className="review-tile"
              onClick={handleContinueWithLinkedIn}
              disabled={busy}
            >
              <LinkedInIcon size={18} />
              <span>Continue with LinkedIn</span>
            </button>
            <button
              type="button"
              className="review-tile"
              onClick={handleVerifyCustom}
              disabled={busy}
            >
              <span>Using College ID/Gmail</span>
            </button>
          </div>
        </div>
      )}

      {step === "linkedin-login" && (
        <div className="review-verify__body">
          <div className="review-verify__linkedin-mock" role="status">
            <LinkedInIcon size={28} />
            <p className="review-verify__linkedin-mock-title">LinkedIn</p>
            <p className="review-verify__linkedin-mock-copy">
              Waiting for LinkedIn sign-in in the popup…
            </p>
            <div className="review-verify__linkedin-spinner" aria-hidden />
            <div className="review-verify__actions review-verify__actions--stretch">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  linkedinIntentRef.current = false;
                  setBusy(false);
                  setStep("choose");
                }}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleContinueWithLinkedIn}
                disabled={busy}
              >
                Open LinkedIn again
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "email-enter" && (
        <div className="review-verify__body">
          <div className="college-review-form__field">
            <Label
              htmlFor="college-email"
              className="college-review-form__question"
            >
              College email / Gmail
              <span className="review-criteria__required">*</span>
            </Label>
            <Input
              id="college-email"
              className="college-review-form__input"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  void handleSendEmailCode();
                }
              }}
            />
          </div>
          <div className="review-verify__actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("method")}
              disabled={busy}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void handleSendEmailCode()}
            >
              {busy ? "Sending…" : "Send code"}
            </Button>
          </div>
        </div>
      )}

      {step === "email-otp" && (
        <div className="review-verify__body">
          <div className="college-review-form__field">
            <Label className="college-review-form__question">
              Verification code
              <span className="review-criteria__required">*</span>
            </Label>
            <div className="review-verify__otp">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                autoFocus
                disabled={busy}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <div className="review-verify__actions review-verify__actions--stretch">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOtp("");
                setStep("email-enter");
              }}
              disabled={busy}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={busy || otp.length !== 6}
              onClick={() => void handleVerifyEmailOtp()}
            >
              {busy ? "Verifying…" : "Verify"}
            </Button>
          </div>
          <button
            type="button"
            className="review-verify__link"
            disabled={busy || resendCooldown > 0}
            onClick={() => void sendEmailOtp(email)}
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend code"}
          </button>
        </div>
      )}

      {step === "identity" && (
        <div className="review-verify__body">
          <div className="college-review-form__field">
            <Label htmlFor="verify-name" className="college-review-form__question">
              Full name (as per college ID or certificate)
              <span className="review-criteria__required">*</span>
            </Label>
            <div className="review-verify__input-wrap">
              <Input
                id="verify-name"
                className={`college-review-form__input${
                  nameVerified ? " review-verify__input--verified" : ""
                }`}
                placeholder="Full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                autoFocus
              />
              {nameVerified ? (
                <span
                  className="review-verify__input-check"
                  aria-label="Verified"
                  title="Verified"
                >
                  <svg
                    viewBox="0 0 20 20"
                    width="18"
                    height="18"
                    aria-hidden
                  >
                    <circle cx="10" cy="10" r="10" fill="#16a34a" />
                    <path
                      d="M5.8 10.2 8.5 12.8 14.2 7.2"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : null}
            </div>
          </div>
          <div className="review-verify__actions">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setStep(verifyPath === "custom" ? "method" : "choose")
              }
            >
              Back
            </Button>
            <Button type="button" onClick={handleIdentityContinue} disabled={busy}>
              {busy
                ? "Saving…"
                : affiliationChoice === "skipped"
                  ? "Skip/Post Unverified"
                  : "Continue"}
            </Button>
          </div>
        </div>
      )}

      {step === "send" && (
        <div className="review-verify__body">
          <div className="review-verify__name-card">
            <p className="review-verify__name-label">Submitting as</p>
            <div className="review-verify__name-row">
              <p className="review-verify__name-value">{displayName.trim()}</p>
              {nameVerified ? (
                <span
                  className="review-verify__name-check"
                  aria-label="Verified"
                  title="Verified"
                >
                  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
                    <circle cx="10" cy="10" r="10" fill="#16a34a" />
                    <path
                      d="M5.8 10.2 8.5 12.8 14.2 7.2"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : null}
            </div>
            {linkedinConnected ? (
              <p className="review-verify__name-source">
                Connected via LinkedIn
              </p>
            ) : emailVerified ? (
              <p className="review-verify__name-source">
                Verified via {email}
              </p>
            ) : null}
          </div>
          <div className="review-verify__actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("identity")}
              disabled={busy}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => void submitReview(resolveSendMethod())}
              disabled={busy}
            >
              {busy ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>
      )}

      {step === "method" && (
        <div className="review-verify__body">
          <div className="review-tiles" data-columns="1" role="group">
            <button
              type="button"
              className="review-tile"
              onClick={handleCollegeEmail}
              disabled={busy}
            >
              <span>College Email</span>
            </button>
            <button
              type="button"
              className="review-tile"
              onClick={() => {
                setAffiliationChoice("document");
                setStep("identity");
              }}
            >
              <span>Upload ID/Degree/marksheet</span>
            </button>
          </div>
          <div className="review-verify__actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("choose")}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAffiliationChoice("skipped");
                setStep("identity");
              }}
              disabled={busy}
            >
              Skip/Post Unverified
            </Button>
          </div>
        </div>
      )}

      {step === "document" && (
        <div className="review-verify__body">
          <h4 className="review-verify__section-title">Document type</h4>
          <div className="college-review-form__field">
            <Select
              value={docType}
              onValueChange={(value) => setDocType((value as DocType) ?? "")}
            >
              <SelectTrigger className="college-review-form__select" size="default">
                <SelectValue placeholder="Select document type" />
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

          <input
            ref={fileInputRef}
            type="file"
            accept={REVIEW_DOCUMENT_ACCEPT}
            className="sr-only"
            onChange={(e) =>
              handleDocFileChange(e.target.files?.[0] ?? null)
            }
          />
          <button
            type="button"
            className="review-verify__upload"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp aria-hidden />
            <span>
              {docFile
                ? `${docFile.name} (${formatBytes(docFile.size)})`
                : `Click to upload (max ${formatBytes(REVIEW_DOCUMENT_MAX_BYTES)})`}
            </span>
          </button>

          <div className="review-verify__actions">
            <Button type="button" variant="outline" onClick={() => setStep("identity")}>
              Back
            </Button>
            <Button
              type="button"
              onClick={() => void handleDocumentSubmit()}
              disabled={busy}
            >
              {busy ? "Uploading…" : "Submit for review"}
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="review-verify__body review-verify__body--done">
          <div className="review-verify__success">
            <div className="review-verify__success-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path
                  d="M5 12.5 10 17.5 19 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="review-verify__success-title">
              {submittedUnverified
                ? "Review posted (unverified)"
                : "Congrats! Your Review is published"}
            </h3>
            <p className="review-verify__success-copy">
              {submittedUnverified
                ? "Your review was saved without email or document verification. You can verify later to build more trust."
                : fullyAnonymous
                  ? "Thanks for sharing your experience anonymously and helping students make informed decisions."
                  : "Thanks for sharing your experience and helping students make informed decisions."}
            </p>
            <Button
              type="button"
              className="review-verify__success-btn"
              onClick={() => {
                onComplete();
              }}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
