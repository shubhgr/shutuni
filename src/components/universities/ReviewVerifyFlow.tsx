"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp, Link2 } from "lucide-react";
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
import { isValidEmail } from "@/lib/review-email-verify";

import "@/styles/university-detail.css";

type VerifyStep =
  | "identity"
  | "method"
  | "email"
  | "otp"
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
  fullyAnonymous?: boolean;
  onComplete: () => void;
}

export function ReviewVerifyFlow({
  institutionName,
  fullyAnonymous = true,
  onComplete,
}: ReviewVerifyFlowProps) {
  const [step, setStep] = useState<VerifyStep>("identity");
  const [displayName, setDisplayName] = useState("");
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [docType, setDocType] = useState<DocType | "">("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateLinkedInSession() {
      try {
        const res = await fetch("/api/auth/linkedin/session", {
          credentials: "same-origin",
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          connected?: boolean;
          name?: string;
        };
        if (!data.connected || cancelled) return;
        setLinkedinConnected(true);
        if (data.name?.trim()) {
          setDisplayName((current) => current.trim() || data.name!.trim());
        }
      } catch {
        /* no session yet */
      }
    }

    void hydrateLinkedInSession();

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
        toast.error(data.message || "LinkedIn connection failed.");
        return;
      }
      void (async () => {
        try {
          const res = await fetch("/api/auth/linkedin/session", {
            credentials: "same-origin",
          });
          if (!res.ok) {
            toast.error("LinkedIn connected, but we could not load your profile.");
            return;
          }
          const session = (await res.json()) as {
            name?: string;
          };
          setLinkedinConnected(true);
          if (session.name?.trim()) {
            setDisplayName(session.name.trim());
          }
          toast.success("LinkedIn verified");
        } catch {
          toast.error("LinkedIn connected, but we could not load your profile.");
        }
      })();
    }

    window.addEventListener("message", onMessage);
    return () => {
      cancelled = true;
      window.removeEventListener("message", onMessage);
    };
  }, []);

  function finish() {
    setStep("done");
    window.setTimeout(() => {
      toast.success(
        fullyAnonymous
          ? "Review submitted anonymously. (UI demo — not saved yet.)"
          : "Review submitted. (UI demo — not saved yet.)"
      );
      onComplete();
    }, 700);
  }

  function handleIdentityContinue() {
    if (!displayName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!linkedinConnected) {
      toast.error("Connect LinkedIn to continue.");
      return;
    }
    setStep("method");
  }

  function handleConnectLinkedin() {
    setBusy(true);
    const width = 600;
    const height = 700;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
    const popup = window.open(
      "/api/auth/linkedin",
      "linkedin-oauth",
      `width=${width},height=${height},left=${left},top=${top},popup=yes`
    );
    if (!popup) {
      setBusy(false);
      toast.error("Allow popups for this site to connect LinkedIn.");
      return;
    }
    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer);
        setBusy(false);
      }
    }, 500);
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
      finish();
    }, 400);
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

  const stepTitle: Record<VerifyStep, string> = {
    identity: "Let’s verify your review",
    method: "Your LinkedIn profile is verified",
    email: "Verify your college email",
    otp: "Enter the code",
    document: "Upload your document",
    done: "Submitted",
  };

  const stepHint: Record<VerifyStep, string> = {
    identity: fullyAnonymous
      ? "We won’t share your name or any personal details on the platform or with other users. This is only to confirm you’re real and that your review isn’t spam."
      : `Confirm who you are so we can keep spam out of ${institutionName}.`,
    method:
      "Choose college email or a document to prove affiliation. You can also skip for now.",
    email:
      "Works if your college ID is still active. We’ll send a one-time code.",
    otp: `We sent a 6-digit code to ${email}.`,
    document:
      "Marksheet, ID card, or degree certificate. Always works.",
    done: "Thanks — your review is in.",
  };

  return (
    <div className="review-verify" aria-label="Review verification">
      <header className="review-verify__header">
        <h3 className="review-verify__title">{stepTitle[step]}</h3>
        <p className="review-verify__hint">{stepHint[step]}</p>
      </header>

      {step === "identity" && (
        <div className="review-verify__body">
          <div className="college-review-form__field">
            <Label htmlFor="verify-name" className="college-review-form__question">
              Full name (as per college ID or certificate)
              <span className="review-criteria__required">*</span>
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
          </div>
          <div className="review-verify__actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleConnectLinkedin}
              disabled={busy || linkedinConnected}
            >
              <Link2 aria-hidden />
              {linkedinConnected
                ? "LinkedIn verified"
                : busy
                  ? "Connecting…"
                  : "Connect your LinkedIn"}
            </Button>
            <Button type="button" onClick={handleIdentityContinue}>
              Continue
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
              onClick={() => setStep("email")}
            >
              <span>College email</span>
            </button>
            <button
              type="button"
              className="review-tile"
              onClick={() => setStep("document")}
            >
              <span>Upload document</span>
            </button>
          </div>
          <p className="college-review-form__hint">
            College email works if your ID is still active. Documents (marksheet,
            ID card, degree) always work.
          </p>
          <div className="review-verify__actions">
            <Button type="button" variant="outline" onClick={() => setStep("identity")}>
              Back
            </Button>
            <Button type="button" variant="outline" onClick={finish}>
              Skip for now
            </Button>
          </div>
        </div>
      )}

      {step === "email" && (
        <div className="review-verify__body">
          <div className="college-review-form__field">
            <Label htmlFor="verify-email" className="college-review-form__question">
              College email
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
          </div>
          <div className="review-verify__actions">
            <Button type="button" variant="outline" onClick={() => setStep("method")}>
              Back
            </Button>
            <Button type="button" onClick={handleSendOtp} disabled={busy}>
              {busy ? "Sending…" : "Send code"}
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
                  : "Didn’t get it? Resend"}
              </button>
            </p>
          </div>
          <div className="review-verify__actions">
            <Button type="button" variant="outline" onClick={() => setStep("email")}>
              Back
            </Button>
            <Button type="button" onClick={handleVerifyOtp} disabled={busy}>
              {busy ? "Verifying…" : "Verify"}
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
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
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
                : "Drag & drop or click to upload"}
            </span>
          </button>

          <div className="review-verify__actions">
            <Button type="button" variant="outline" onClick={() => setStep("method")}>
              Back
            </Button>
            <Button type="button" onClick={handleDocumentSubmit}>
              Submit for review
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="review-verify__body review-verify__body--done">
          <p className="review-verify__done-copy">All set.</p>
        </div>
      )}
    </div>
  );
}
