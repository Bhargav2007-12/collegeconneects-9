import { GraduationCap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 text-lg font-display font-bold">
            <GraduationCap size={20} className="text-neon-orange" />
            <span className="text-foreground">College</span>
            <span className="gradient-text-orange">Connect</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>

          {/* Attribution */}
          <p className="text-sm text-muted-foreground text-center">
            © {year}. Built with <span className="text-neon-orange">♥</span>
          </p>
        </div>
      </div>
    </footer>
  );
}