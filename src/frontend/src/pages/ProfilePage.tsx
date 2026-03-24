import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type AppRole, useAuthContext } from "../contexts/AuthContext";
import { useUpdateMyProfile } from "../hooks/useQueries";

function roleBadgeClass(role: AppRole) {
  const map: Record<AppRole, string> = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    instructor: "bg-blue-100 text-blue-700 border-blue-200",
    learner: "bg-emerald-100 text-emerald-700 border-emerald-200",
    guest: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return map[role];
}

export default function ProfilePage() {
  const { profile, role, refetchProfile } = useAuthContext();
  const updateProfile = useUpdateMyProfile();

  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        email: email.trim(),
      });
      refetchProfile();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      data-ocid="profile.page"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your personal information.
        </p>
      </div>

      <div className="space-y-6">
        {/* Avatar & Role */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-lg">
                  {profile?.name ?? "—"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {profile?.email ?? "—"}
                </p>
                <Badge className={`${roleBadgeClass(role)} mt-1.5 capitalize`}>
                  {role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Edit Information
            </CardTitle>
            <CardDescription>
              Changes will be saved to your profile immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  data-ocid="profile.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email Address</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  data-ocid="profile.email.input"
                />
              </div>
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="gap-2"
                data-ocid="profile.save.submit_button"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
