import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";

export default function DashboardPage() {
  const { role, isFetched, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isFetched) return;
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (role === "admin") {
      navigate({ to: "/instructor/courses" });
    } else if (role === "instructor") {
      navigate({ to: "/instructor/courses" });
    } else {
      navigate({ to: "/learner/courses" });
    }
  }, [role, isFetched, isAuthenticated, navigate]);

  return (
    <div
      className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground"
      data-ocid="dashboard.loading_state"
    >
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Redirecting to your dashboard...</span>
    </div>
  );
}
