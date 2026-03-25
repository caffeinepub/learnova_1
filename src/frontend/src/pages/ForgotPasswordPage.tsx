import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    // Simulate async delay
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          data-ocid="forgot_password.link"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        <div className="bg-card border border-border rounded-2xl shadow-card p-8 space-y-6">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>

          {submitted ? (
            <div
              className="space-y-4"
              data-ocid="forgot_password.success_state"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                <h1 className="text-2xl font-black text-foreground">
                  Check your inbox
                </h1>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                If an account exists for{" "}
                <span className="font-semibold text-foreground">{email}</span>,
                you'll receive reset instructions shortly.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn't get the email? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-primary hover:underline font-medium"
                >
                  try again
                </button>
                .
              </p>
              <Link to="/login">
                <Button
                  className="w-full mt-2"
                  data-ocid="forgot_password.primary_button"
                >
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-foreground">
                  Reset Password
                </h1>
                <p className="text-muted-foreground text-sm">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                data-ocid="forgot_password.panel"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      data-ocid="forgot_password.input"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                  data-ocid="forgot_password.submit_button"
                >
                  {isLoading ? (
                    <>
                      <Mail className="mr-2 h-4 w-4 animate-pulse" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send Reset Link
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          🔒 Password resets are handled via Internet Identity for maximum
          security
        </p>
      </div>
    </div>
  );
}
