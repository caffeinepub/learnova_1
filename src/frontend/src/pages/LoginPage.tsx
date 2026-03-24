import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const { isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const isLoggingIn = loginStatus === "logging-in";

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-sidebar rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="h-9 w-9 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in with Internet Identity to access LearnOva
            </p>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-8 shadow-card space-y-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              Secure, decentralized login
            </p>
            <p>
              LearnOva uses Internet Identity — no passwords required. Your
              identity is cryptographically protected.
            </p>
          </div>
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="login.submit_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign In with Internet Identity"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            New to LearnOva? Signing in will automatically create your account.
          </p>
        </div>
      </div>
    </div>
  );
}
