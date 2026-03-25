import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type RoleChoice = "instructor" | "learner";

export default function SignupPage() {
  const { login, loginStatus } = useInternetIdentity();
  const { isAuthenticated, isLoading, isFetched, role } = useAuthContext();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const isLoggingIn = loginStatus === "logging-in";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleChoice>("learner");

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
    // Store pending role before triggering II so RegisterModal can pre-select it
    localStorage.setItem("learnova_pending_role", selectedRole);
    login();
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel */}
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
              {
                icon: ShieldCheck,
                label: "Stay secure",
                sub: "Decentralized auth",
              },
              {
                icon: KeyRound,
                label: "No passwords",
                sub: "Internet Identity",
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

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
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
            {/* Role selector */}
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
                  <GraduationCap className="h-4 w-4" />
                  Instructor
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
                  <Users className="h-4 w-4" />
                  Learner
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  data-ocid="signup.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  data-ocid="signup.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  data-ocid="signup.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  data-ocid="signup.input"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={isLoggingIn}
              data-ocid="signup.submit_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

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
              data-ocid="signup.secondary_button"
            >
              Sign In
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
