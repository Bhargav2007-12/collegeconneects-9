import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckCircle, Mail, Loader } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Link, useNavigate } from "@tanstack/react-router";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh"
];

export default function StudentSignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState("");
  const [academicStatus, setAcademicStatus] = useState("");
  const [jeeMainsPercentile, setJeeMainsPercentile] = useState("");
  const [jeeMainsRank, setJeeMainsRank] = useState("");
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  useEffect(() => {
    document.title = "Student Sign Up — CollegeConnect";
  }, []);

  const isValidEmail = (e: string) => e.includes("@") && e.includes(".");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setVerified(false);
    setPasswordSent(false);
  };

  const handleVerify = async () => {
    if (!email || !isValidEmail(email)) {
      alert("Please enter a valid email first!");
      return;
    }
    setVerifying(true);
    await new Promise((res) => setTimeout(res, 2000));
    setVerifying(false);
    setVerified(true);
    setPasswordSent(true);
    console.log("Password sent to:", email);
  };

  const handleSignup = () => {
    if (!name || !email || !phone || !gender || !state || !academicStatus || !jeeMainsPercentile || !jeeMainsRank || !password) {
      alert("Please fill all required fields!");
      return;
    }
    if (!verified) {
      alert("Please verify your email first!");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Student signing up:", { name, email, phone, gender, state, academicStatus, jeeMainsPercentile, jeeMainsRank, jeeAdvancedRank });
    // ✅ Redirect to student dashboard
    navigate({ to: "/student/dashboard" });
  };

  return (
    <AuthShell
      title="Student Sign Up"
      subtitle="Create your student account to book sessions with advisors."
    >
      <div className="flex flex-col gap-4">

        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Full Name <span className="text-neon-teal">•</span></label>
          <input type="text" placeholder="Your full name" value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors" />
        </div>

        {/* Email + Verify */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Email <span className="text-neon-teal">•</span></label>
          <div className="flex gap-2">
            <input type="email" placeholder="you@gmail.com" value={email}
              onChange={handleEmailChange} disabled={verified}
              className={`flex-1 bg-background border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none transition-colors ${
                verified ? "border-green-500 text-green-400 cursor-not-allowed opacity-70"
                : isValidEmail(email) ? "border-neon-teal focus:border-neon-teal"
                : "border-border focus:border-neon-teal"}`}
            />
            {!verified && (
              <button type="button" onClick={handleVerify}
                disabled={!isValidEmail(email) || verifying}
                className="inline-flex items-center justify-center gap-2 bg-neon-teal hover:bg-neon-teal/80 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-xl px-4 py-2 text-sm transition-all duration-300"
              >
                {verifying ? <><Loader size={14} className="animate-spin" />Sending...</> : <><Mail size={14} />Verify</>}
              </button>
            )}
            {verified && (
              <div className="inline-flex items-center gap-1 text-green-500 text-sm px-3">
                <CheckCircle size={16} /> Verified
              </div>
            )}
          </div>
          {!verified && !passwordSent && (
            <p className="text-xs text-muted-foreground mt-1">📧 Click Verify — CollegeConnect will send your password to this email</p>
          )}
          {verified && (
            <p className="text-xs text-green-500 mt-1">✅ Email verified! Password has been sent to {email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Phone Number <span className="text-neon-teal">•</span></label>
          <input type="tel" placeholder="+91 XXXXX XXXXX" value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors" />
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Gender <span className="text-neon-teal">•</span></label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* State */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">State <span className="text-neon-teal">•</span></label>
          <select value={state} onChange={(e) => setState(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer">
            <option value="">Select your state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Academic Status */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Academic Status <span className="text-neon-teal">•</span></label>
          <select value={academicStatus} onChange={(e) => setAcademicStatus(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer">
            <option value="">Select status</option>
            <option value="12th">Currently in 12th</option>
            <option value="drop1">1st Drop</option>
            <option value="drop2">2nd Drop</option>
          </select>
        </div>

        {/* JEE Mains */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">JEE Mains <span className="text-neon-teal">•</span></label>
          <div className="flex gap-2">
            <input type="number" placeholder="Percentile (e.g. 98.5)" value={jeeMainsPercentile}
              onChange={(e) => setJeeMainsPercentile(e.target.value)}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors" />
            <input type="number" placeholder="Rank" value={jeeMainsRank}
              onChange={(e) => setJeeMainsRank(e.target.value)}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors" />
          </div>
        </div>

        {/* JEE Advanced */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">JEE Advanced Rank <span className="text-xs">(optional)</span></label>
          <input type="number" placeholder="Your JEE Advanced rank" value={jeeAdvancedRank}
            onChange={(e) => setJeeAdvancedRank(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors" />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Password <span className="text-neon-teal">•</span></label>
          <input type="password" placeholder="Enter password sent by CollegeConnect"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors" />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Confirm Password <span className="text-neon-teal">•</span></label>
          <input type="password" placeholder="••••••••"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors" />
        </div>

        {/* Button */}
        <div className="mt-2">
          <Button onClick={handleSignup} disabled={!verified}
            className="w-full bg-neon-teal hover:bg-neon-teal/90 text-background font-semibold rounded-xl px-5 glow-teal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <UserPlus size={16} className="mr-2" />
            Create Account
          </Button>
          {!verified && (
            <p className="text-xs text-muted-foreground text-center mt-2">Please verify your email to continue</p>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/auth/student/login" className="text-neon-teal hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}