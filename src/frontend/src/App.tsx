import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseEditPage from "./pages/CourseEditPage";
import CoursesDashboard from "./pages/CoursesDashboard";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import InstructorDashboard from "./pages/InstructorDashboard";
import LearnerCoursesPage from "./pages/LearnerCoursesPage";
import LearnerDashboard from "./pages/LearnerDashboard";
import LessonPlayerPage from "./pages/LessonPlayerPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ReportingDashboardPage from "./pages/ReportingDashboardPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  ),
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
