import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { getFirebaseAnalytics, getFirebaseApp } from "./lib/firebase";
import { FirebaseAuthShell } from "./hooks/useInternetIdentity";
import { AppRouterProvider } from "./router";
import "../index.css";

getFirebaseApp();
void getFirebaseAnalytics();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

// User sign-in/sign-up: Firebase Auth only. FirebaseAuthShell avoids loading Internet Identity (IC).
ReactDOM.createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthShell>
        <AppRouterProvider />
      </FirebaseAuthShell>
    </QueryClientProvider>
  </HelmetProvider>,
);
