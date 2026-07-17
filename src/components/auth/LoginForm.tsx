"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { isAuthenticated, login } from "@/lib/auth";

import "@/styles/login.css";

type LoginStep = "email" | "otp";

function getEmailFromForm(
  event: React.FormEvent<HTMLFormElement>,
  currentValue: string
): string {
  const formData = new FormData(event.currentTarget);
  const formEmail = formData.get("email");

  if (typeof formEmail === "string" && formEmail.trim()) {
    return formEmail.trim();
  }

  return currentValue.trim();
}

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/universities");
    }
  }, [router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  function validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function handleSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const resolvedEmail = getEmailFromForm(e, email);
    setEmail(resolvedEmail);

    if (!validateEmail(resolvedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setStep("otp");
      setResendCooldown(60);
      setIsSubmitting(false);
    }, 600);
  }

  function handleResendCode() {
    if (resendCooldown > 0 || isResending) return;

    setError("");
    setIsResending(true);
    setTimeout(() => {
      setOtp("");
      setResendCooldown(60);
      setIsResending(false);
    }, 600);
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      login(email);
      router.push("/universities");
    }, 600);
  }

  function handleChangeEmail() {
    setStep("email");
    setOtp("");
    setError("");
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <CardHeader className="login-card__header">
          <CardTitle className="login-card__title">
            {step === "email" ? "Welcome" : "Check your inbox"}
          </CardTitle>
          {step === "email" ? (
            <CardDescription className="login-card__subtitle">
              Sign in or create an account with your email. No password needed.
            </CardDescription>
          ) : (
            <p className="login-card__subtitle login-card__otp-message">
              We sent a verification code to{" "}
              <span className="login-card__email-line">
                <span className="login-card__email">{email}</span>
                <button
                  type="button"
                  className="login-card__edit-email"
                  onClick={handleChangeEmail}
                  aria-label="Change email"
                >
                  <Pencil aria-hidden />
                </button>
              </span>
            </p>
          )}
        </CardHeader>

        <CardContent>
          {step === "email" ? (
            <form className="login-form" onSubmit={handleSendCode}>
              <div className="login-form__field">
                <Label htmlFor="email" className="login-form__label">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {error && <p className="login-form__error">{error}</p>}

              <div className="login-form__actions">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending code…" : "Continue with email"}
                </Button>
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleVerifyOtp}>
              <p className="login-form__demo-hint">
                No email is sent in this preview. Enter any 6-digit code to
                continue.
              </p>
              <div className="login-form__field">
                <Label className="login-form__label">Verification code</Label>
                <div className="login-form__otp-wrapper">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    autoFocus
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

              {error && <p className="login-form__error">{error}</p>}

              <div className="login-form__actions">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying…" : "Verify & continue"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="login-form__resend"
                  disabled={isSubmitting || isResending || resendCooldown > 0}
                  onClick={handleResendCode}
                >
                  {isResending
                    ? "Sending code…"
                    : resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : "Resend code"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
