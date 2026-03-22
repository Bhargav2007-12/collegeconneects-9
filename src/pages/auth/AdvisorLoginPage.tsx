import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Link, useNavigate } from "@tanstack/react-router";

export default function AdvisorLoginPage() {
  const [name, setName] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    if (!name || !collegeEmail || !password) {
      alert("Please fill all fields!");
      return;
    }
    console.log("Advisor logging in:", { name, collegeEmail });
    // ✅ Redirect to advisor dashboard after login
    navigate({ to: "/advisor/dashboard" });
  };

  return (
    <AuthShell
      title="Advisor Sign In"
      subtitle="Welcome back. Sign in to manage your advisor profile."
    >
      <div className="flex flex-col gap-4">

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Full Name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
        </div>

        {/* College Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">College Email</label>
          <input
            type="email"
            placeholder="you@college.edu.in"
            value={collegeEmail}
            onChange={(e) => setCollegeEmail(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            onClick={handleLogin}
            className="bg-neon-orange hover:bg-neon-orange/90 text-background font-semibold rounded-xl px-5 glow-orange transition-all duration-300"
          >
            <LogIn size={16} className="mr-2" />
            Sign In
          </Button>
          <Button
            variant="outline"
            className="border-neon-orange/40 text-neon-orange hover:bg-neon-orange/10 hover:border-neon-orange rounded-xl px-5 transition-all duration-300"
          >
            Forgot Password
          </Button>
        </div>

        {/* Signup Link */}
        <p className="text-sm text-muted-foreground text-center mt-2">
          New advisor?{" "}
          <Link to="/auth/advisor/signup" className="text-neon-orange hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}