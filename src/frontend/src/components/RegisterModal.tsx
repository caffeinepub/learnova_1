import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRegisterProfile } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onSuccess: () => Promise<void>;
}

type RoleChoice = "learner" | "instructor";

export default function RegisterModal({ open, onSuccess }: Props) {
  const { identity } = useInternetIdentity();
  const pendingRole = localStorage.getItem(
    "learnova_pending_role",
  ) as RoleChoice | null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleChoice>(
    pendingRole ?? "learner",
  );
  const register = useRegisterProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    try {
      await register.mutateAsync({ name: name.trim(), email: email.trim() });
      // Save role to localStorage keyed by principal
      if (identity) {
        localStorage.setItem(
          `learnova_role_${identity.getPrincipal().toString()}`,
          selectedRole,
        );
      }
      // Clear pending role
      localStorage.removeItem("learnova_pending_role");
      toast.success("Profile created! Welcome to LearnOva.");
      await onSuccess();
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" data-ocid="register.dialog">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            You're almost in! Fill in your details to get started on LearnOva.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Full Name</Label>
            <Input
              id="reg-name"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-ocid="register.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-email">Email Address</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-ocid="register.input"
            />
          </div>

          {/* Role selector */}
          <div className="space-y-1.5">
            <Label>I am joining as</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("instructor")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                  selectedRole === "instructor"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
                data-ocid="register.toggle"
              >
                <GraduationCap className="h-5 w-5" />
                Instructor
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("learner")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                  selectedRole === "learner"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
                data-ocid="register.toggle"
              >
                <Users className="h-5 w-5" />
                Learner
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={register.isPending}
            data-ocid="register.submit_button"
          >
            {register.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {register.isPending ? "Creating profile..." : "Get Started"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
