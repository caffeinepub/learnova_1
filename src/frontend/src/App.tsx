import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { GraduationCap, Home } from "lucide-react";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import CheckoutPage from "./pages/CheckoutPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseEditPage from "./pages/CourseEditPage";
import CoursesDashboard from "./pages/CoursesDashboard";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import InstructorDashboard from "./pages/InstructorDashboard";
import LearnerCoursesPage from "./pages/LearnerCoursesPage";
import LearnerDashboard from "./pages/LearnerDashboard";
import LessonPlayerPage from "./pages/LessonPlayerPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ReportingDashboardPage from "./pages/ReportingDashboardPage";
import SignupPage from "./pages/SignupPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <GraduationCap className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-5xl font-black text-foreground mb-3">404</h1>
      <h2 className="text-xl font-bold text-foreground mb-2">Page Not Found</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        data-ocid="notfound.link"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  ),
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupPage,
});
const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});
const unauthorizedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/unauthorized",
  component: UnauthorizedPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  ),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/users",
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminUsersPage />
    </ProtectedRoute>
  ),
});

const instructorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/instructor",
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "instructor"]}>
      <InstructorDashboard />
    </ProtectedRoute>
  ),
});

const instructorCoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/instructor/courses",
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "instructor"]}>
      <CoursesDashboard />
    </ProtectedRoute>
  ),
});

const courseEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/instructor/courses/$courseId/edit",
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "instructor"]}>
      <CourseEditPage />
    </ProtectedRoute>
  ),
});

const reportingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/instructor/reporting",
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "instructor"]}>
      <ReportingDashboardPage />
    </ProtectedRoute>
  ),
});

const learnerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learner",
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "learner"]}>
      <LearnerDashboard />
    </ProtectedRoute>
  ),
});

const learnerCoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learner/courses",
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "learner"]}>
      <LearnerCoursesPage />
    </ProtectedRoute>
  ),
});

const courseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learner/courses/$courseId",
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "learner"]}>
      <CourseDetailPage />
    </ProtectedRoute>
  ),
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learner/courses/$courseId/checkout",
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "learner"]}>
      <CheckoutPage />
    </ProtectedRoute>
  ),
});

const lessonPlayerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learner/courses/$courseId/lessons/$lessonId",
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "learner"]}>
      <LessonPlayerPage />
    </ProtectedRoute>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <ProtectedRoute allowedRoles={["admin", "instructor", "learner"]}>
      <ProfilePage />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  signupRoute,
  forgotPasswordRoute,
  dashboardRoute,
  unauthorizedRoute,
  adminRoute,
  adminUsersRoute,
  instructorRoute,
  instructorCoursesRoute,
  courseEditRoute,
  reportingRoute,
  learnerRoute,
  learnerCoursesRoute,
  courseDetailRoute,
  checkoutRoute,
  lessonPlayerRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
