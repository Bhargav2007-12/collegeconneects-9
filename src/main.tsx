import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { AppRouterProvider } from "./router";
import "../index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <AppRouterProvider />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
