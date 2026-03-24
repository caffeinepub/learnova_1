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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterProfile } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onSuccess: () => void;
}

export default function RegisterModal({ open, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const register = useRegisterProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    try {
      await register.mutateAsync({ name: name.trim(), email: email.trim() });
      toast.success("Profile created! Welcome to LearnOva.");
      onSuccess();
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
