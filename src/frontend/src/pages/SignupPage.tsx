import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";

type RoleChoice = "instructor" | "learner";

export default function SignupPage() {
  const { signup, loginWithII } = useAuthContext();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleChoice>("learner");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = await signup(
      email.trim(),
      password,
      name.trim(),
      selectedRole,
    );
    setIsLoading(false);
    if (!result.success) {
      setError(result.error ?? "Signup failed.");
    } else {
      if (result.role === "admin" || result.role === "instructor") {
        navigate({ to: "/instructor/courses" });
      } else {
        navigate({ to: "/learner/courses" });
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-800 flex-col items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl" />
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
              Start your
              <br />
              <span className="text-violet-200">journey today.</span>
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Whether you're here to teach or to learn, LearnOva gives you the
              tools to grow.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: GraduationCap,
                label: "Teach courses",
                sub: "Share your expertise",
              },
              {
                icon: BookOpen,
                label: "Learn skills",
                sub: "At your own pace",
              },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 text-left">
                <Icon className="h-4 w-4 text-violet-200 mb-1.5" />
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-white/60">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
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
              Create account
            </h1>
            <p className="text-muted-foreground">
              Join LearnOva and start learning today
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-ocid="signup.panel"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-ocid="signup.input"
              />
            </div>
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
                data-ocid="signup.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                data-ocid="signup.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                data-ocid="signup.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label>I want to join as</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("instructor")}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    selectedRole === "instructor"
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                  data-ocid="signup.toggle"
                >
                  <GraduationCap className="h-4 w-4" /> Instructor
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("learner")}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    selectedRole === "learner"
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                  data-ocid="signup.toggle"
                >
                  <Users className="h-4 w-4" /> Learner
                </button>
              </div>
            </div>

            {error && (
              <p
                className="text-sm text-destructive"
                data-ocid="signup.error_state"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={isLoading}
              data-ocid="signup.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Internet Identity option */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={loginWithII}
            disabled={isLoading}
            data-ocid="signup.secondary_button"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Sign up with Internet Identity
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <Link to="/login">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              data-ocid="signup.link"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
