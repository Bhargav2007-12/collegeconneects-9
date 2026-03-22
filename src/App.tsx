import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import type { ReactNode } from "react";

export default function App({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
