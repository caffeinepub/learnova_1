import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-[70vh] flex items-center justify-center px-4"
      data-ocid="unauthorized.page"
    >
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to view this page. Please contact your
            administrator if you believe this is a mistake.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate({ to: "/" })}
            variant="outline"
            className="gap-2"
            data-ocid="unauthorized.go_home.button"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
          <Button
            onClick={() => navigate({ to: "/dashboard" })}
            data-ocid="unauthorized.go_dashboard.primary_button"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
