import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { GraduationCap, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useLocalAuth } from "../hooks/useLocalAuth";

export default function LoginPage() {
  const { login } = useLocalAuth();
  const { isAuthenticated, role } = useAuthContext();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (isAuthenticated && role !== "guest") {
      const destination =
        search.redirect ||
        (role === "admin"
          ? "/instructor/courses"
          : role === "instructor"
            ? "/instructor/courses"
            : "/learner/courses");
      navigate({ to: destination });
    }
  }, [isAuthenticated, role, navigate, search.redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = login(email.trim(), password);
    setIsLoading(false);
    if (!result.success) {
      setError(result.error ?? "Login failed.");
    } else {
      // Navigate directly using the role returned from login
      const destination =
        search.redirect ||
        (result.role === "admin"
          ? "/instructor/courses"
          : result.role === "instructor"
            ? "/instructor/courses"
            : "/learner/courses");
      navigate({ to: destination });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 flex-col items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-300/10 blur-3xl" />
        <div className="relative z-10 max-w-sm text-center space-y-8">
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
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
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
            className="space-y-4"
            data-ocid="login.panel"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                data-ocid="login.input"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                data-ocid="login.input"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={isLoading}
              data-ocid="login.submit_button"
            >
              {isLoading ? (
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
        </div>
      </div>
    </div>
  );
}
