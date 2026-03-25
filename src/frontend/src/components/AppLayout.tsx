import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";

interface NavLink {
  label: string;
  to: string;
  icon: React.ReactNode;
}

function getNavLinks(role: string): NavLink[] {
  switch (role) {
    case "admin":
      return [
        {
          label: "Dashboard",
          to: "/admin",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          label: "Users",
          to: "/admin/users",
          icon: <Users className="h-4 w-4" />,
        },
        {
          label: "Courses",
          to: "/instructor/courses",
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          label: "Reporting",
          to: "/instructor/reporting",
          icon: <BarChart3 className="h-4 w-4" />,
        },
      ];
    case "instructor":
      return [
        {
          label: "Dashboard",
          to: "/instructor",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          label: "Courses",
          to: "/instructor/courses",
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          label: "Reporting",
          to: "/instructor/reporting",
          icon: <BarChart3 className="h-4 w-4" />,
        },
      ];
    case "learner":
      return [
        {
          label: "My Courses",
          to: "/learner",
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          label: "Profile",
          to: "/profile",
          icon: <UserIcon className="h-4 w-4" />,
        },
      ];
    default:
      return [
        { label: "Courses", to: "/", icon: <BookOpen className="h-4 w-4" /> },
      ];
  }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, role, isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = getNavLinks(role);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleLogout = () => {
    logout();
    // Explicitly navigate to login — avoids relying on ProtectedRoute's
    // redirect which can race with the state update.
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Learn<span className="text-primary">Ova</span>
              </span>
            </Link>

            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:text-white hover:bg-sidebar-accent transition-colors"
                  data-ocid={`nav.${link.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <Button
                  size="sm"
                  onClick={() => navigate({ to: "/login" })}
                  className="bg-primary hover:bg-primary/90 text-white"
                  data-ocid="nav.login.button"
                >
                  Sign In
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      data-ocid="nav.user_menu.button"
                    >
                      <Avatar className="h-8 w-8 border-2 border-primary/40">
                        <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium text-white max-w-[120px] truncate">
                        {profile?.name ?? "User"}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2"
                        data-ocid="nav.profile.link"
                      >
                        <UserIcon className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                      data-ocid="nav.logout.button"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <button
                type="button"
                className="md:hidden p-2 rounded-md text-sidebar-foreground/80 hover:text-white"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-sidebar-border bg-sidebar px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/80 hover:text-white hover:bg-sidebar-accent transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 animate-fade-in">{children}</main>

      <footer className="bg-sidebar text-sidebar-foreground/60 text-center text-xs py-4">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-sidebar-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
