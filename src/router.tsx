import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import App from "./App";
import HomePage from "./pages/home/HomePage";
import AdvisorLoginPage from "./pages/auth/AdvisorLoginPage";
import AdvisorSignupPage from "./pages/auth/AdvisorSignupPage";
import StudentLoginPage from "./pages/auth/StudentLoginPage";
import StudentSignupPage from "./pages/auth/StudentSignupPage";
import AboutPage from "./pages/footer/AboutPage";
import ContactPage from "./pages/footer/ContactPage";
import PrivacyPage from "./pages/footer/PrivacyPage";
import TermsPage from "./pages/footer/TermsPage";
import GetStartedPage from "./pages/home/GetStartedPage";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AdvisorDashboard from "./pages/dashboard/AdvisorDashboard";

const rootRoute = createRootRoute({
  component: () => (
    <App>
      <Outlet />
    </App>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage });
const advisorSignupRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/advisor/signup", component: AdvisorSignupPage });
const advisorLoginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/advisor/login", component: AdvisorLoginPage });
const studentSignupRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/student/signup", component: StudentSignupPage });
const studentLoginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/student/login", component: StudentLoginPage });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/about", component: AboutPage });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: "/contact", component: ContactPage });
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/privacy", component: PrivacyPage });
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/terms", component: TermsPage });
const getStartedRoute = createRoute({ getParentRoute: () => rootRoute, path: "/get-started", component: GetStartedPage });
const studentDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/student/dashboard", component: StudentDashboard });
const advisorDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/advisor/dashboard", component: AdvisorDashboard });

const routeTree = rootRoute.addChildren([
  indexRoute,
  advisorSignupRoute,
  advisorLoginRoute,
  studentSignupRoute,
  studentLoginRoute,
  aboutRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
  getStartedRoute,
  studentDashboardRoute,
  advisorDashboardRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}