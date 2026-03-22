import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Link, useNavigate } from "@tanstack/react-router";

export default function StudentLoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function handleLogin() {
    if (!name || !email || !password) {
      alert("Please fill all fields!");
      return;
    }
    console.log("Student logging in:", { name, email });
    // ✅ Redirect to student dashboard after login
    navigate({ to: "/student/dashboard" });
  }

  return (
    <AuthShell
      title="Student Sign In"
      subtitle="Welcome back. Sign in to book and manage sessions."
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
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Email</label>
          <input
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
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
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            onClick={handleLogin}
            className="bg-neon-teal hover:bg-neon-teal/90 text-background font-semibold rounded-xl px-5 glow-teal transition-all duration-300"
          >
            <LogIn size={16} className="mr-2" />
            Sign In
          </Button>
          <Button
            variant="outline"
            className="border-neon-teal/40 text-neon-teal hover:bg-neon-teal/10 hover:border-neon-teal rounded-xl px-5 transition-all duration-300"
          >
            Forgot Password
          </Button>
        </div>

        {/* Signup Link */}
        <p className="text-sm text-muted-foreground text-center mt-2">
          New here?{" "}
          <Link to="/auth/student/signup" className="text-neon-teal hover:underline">
            Create account
          </Link>
        </p>

      </div>
    </AuthShell>
  );
}