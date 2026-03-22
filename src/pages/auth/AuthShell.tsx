import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative py-24 px-4 sm:px-6 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, oklch(0.78 0.15 175), transparent)",
        }}
      />

      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass rounded-2xl border border-border p-6 sm:p-8"
        >
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

