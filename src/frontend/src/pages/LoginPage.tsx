import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const { isAuthenticated, isLoading, isFetched, role } = useAuthContext();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const isLoggingIn = loginStatus === "logging-in";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading && isFetched) {
      let destination = search.redirect;
      if (!destination) {
        if (role === "admin") destination = "/admin";
        else if (role === "instructor") destination = "/instructor/courses";
        else destination = "/learner/courses";
      }
      navigate({ to: destination });
    }
  }, [isAuthenticated, isLoading, isFetched, role, navigate, search.redirect]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 flex-col items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.3),transparent_60%)]" />
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-300/10 blur-3xl" />

        <div className="relative z-10 max-w-sm text-center space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight">
              Learn<span className="text-violet-200">Ova</span>
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black leading-tight">
              Learn without
              <br />
              <span className="text-violet-200">boundaries.</span>
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Join thousands of learners and instructors on the world's most
              trusted decentralized learning platform.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: ShieldCheck, text: "Decentralized & secure" },
              { icon: KeyRound, text: "No passwords stored" },
              { icon: Lock, text: "Cryptographic identity" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5"
              >
                <Icon className="h-4 w-4 text-violet-200 shrink-0" />
                <span className="text-sm text-white/90">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black">
              Learn<span className="text-primary">Ova</span>
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to continue your learning journey
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            data-ocid="login.panel"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  data-ocid="login.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                  data-ocid="login.link"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  data-ocid="login.input"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={isLoggingIn}
              data-ocid="login.submit_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                  in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">
                New to LearnOva?
              </span>
            </div>
          </div>

          <Link to="/signup">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              data-ocid="login.secondary_button"
            >
              Create an account
            </Button>
          </Link>

          <p className="text-center text-xs text-muted-foreground">
            🔒 Your account is secured by Internet Identity — no passwords
            stored
          </p>
        </div>
      </div>
    </div>
  );
}
