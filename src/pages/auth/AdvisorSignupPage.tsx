import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckCircle, Mail, Loader, Upload, X } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { useNavigate } from "@tanstack/react-router";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh"
];

const EMAIL_TO_COLLEGE: Record<string, string> = {
  "rgipt.ac.in": "RGIPT",
  "iitd.ac.in": "IIT Delhi",
  "iitb.ac.in": "IIT Bombay",
  "iitm.ac.in": "IIT Madras",
  "iitkgp.ac.in": "IIT Kharagpur",
  "iitk.ac.in": "IIT Kanpur",
  "iitg.ac.in": "IIT Guwahati",
  "iith.ac.in": "IIT Hyderabad",
  "iitr.ac.in": "IIT Roorkee",
  "iitbhu.ac.in": "IIT BHU",
  "iitism.ac.in": "IIT Dhanbad",
  "iiti.ac.in": "IIT Indore",
  "iitgn.ac.in": "IIT Gandhinagar",
  "iitp.ac.in": "IIT Patna",
  "iitrpr.ac.in": "IIT Ropar",
  "iitbbs.ac.in": "IIT Bhubaneswar",
  "iitj.ac.in": "IIT Jodhpur",
  "iitmandi.ac.in": "IIT Mandi",
  "iittp.ac.in": "IIT Tirupati",
  "iitpkd.ac.in": "IIT Palakkad",
  "iitbhilai.ac.in": "IIT Bhilai",
  "iitgoa.ac.in": "IIT Goa",
  "iitjammu.ac.in": "IIT Jammu",
  "iitdh.ac.in": "IIT Dharwad",
  "nitt.edu": "NIT Trichy",
  "nitk.ac.in": "NIT Surathkal",
  "nitw.ac.in": "NIT Warangal",
  "nitrkl.ac.in": "NIT Rourkela",
  "nitc.ac.in": "NIT Calicut",
  "mnit.ac.in": "MNIT Jaipur",
  "mnnit.ac.in": "MNNIT Allahabad",
  "manit.ac.in": "MANIT Bhopal",
  "vnit.ac.in": "VNIT Nagpur",
  "svnit.ac.in": "SVNIT Surat",
  "nitdgp.ac.in": "NIT Durgapur",
  "nitj.ac.in": "NIT Jalandhar",
  "nitjsr.ac.in": "NIT Jamshedpur",
  "nitp.ac.in": "NIT Patna",
  "nitrr.ac.in": "NIT Raipur",
  "nitsri.ac.in": "NIT Srinagar",
  "nits.ac.in": "NIT Silchar",
  "nith.ac.in": "NIT Hamirpur",
  "nita.ac.in": "NIT Agartala",
  "iiita.ac.in": "IIIT Allahabad",
  "iiitm.ac.in": "IIITM Gwalior",
  "iiit.ac.in": "IIIT Hyderabad",
  "iiitb.ac.in": "IIIT Bangalore",
  "iiitd.ac.in": "IIIT Delhi",
  "bits-pilani.ac.in": "BITS Pilani",
  "dtu.ac.in": "DTU Delhi",
  "nsut.ac.in": "NSUT Delhi",
};

function detectCollege(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return "";
  if (EMAIL_TO_COLLEGE[domain]) return EMAIL_TO_COLLEGE[domain];
  for (const key of Object.keys(EMAIL_TO_COLLEGE)) {
    if (domain.includes(key)) return EMAIL_TO_COLLEGE[key];
  }
  return "";
}

function ImageUploadBox({ label, preview, onUpload, onRemove }: {
  label: string; preview: string | null;
  onUpload: (file: File) => void; onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };
  return (
    <div className="flex flex-col gap-1 flex-1">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-green-500 h-32">
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          <button type="button" onClick={onRemove}
            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-black/80 transition-all">
            <X size={12} />
          </button>
          <div className="absolute bottom-1 left-1 bg-green-500/80 rounded-full px-2 py-0.5 text-xs text-white flex items-center gap-1">
            <CheckCircle size={10} /> Uploaded
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="h-32 border-2 border-dashed border-border hover:border-neon-orange rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-neon-orange transition-all duration-300 cursor-pointer">
          <Upload size={20} />
          <span className="text-xs">Click to upload</span>
          <span className="text-xs opacity-60">JPG, PNG (max 5MB)</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </div>
  );
}

export default function AdvisorSignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [detectedCollege, setDetectedCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [phone, setPhone] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [state, setState] = useState("");
  const [jeeMainsPercentile, setJeeMainsPercentile] = useState("");
  const [jeeMainsRank, setJeeMainsRank] = useState("");
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [achievements, setAchievements] = useState("");
  const [languages, setLanguages] = useState("");
  const [sessionPrice, setSessionPrice] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);

  useEffect(() => {
    document.title = "Advisor Sign Up — CollegeConnect";
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setCollegeEmail(email);
    setDetectedCollege(detectCollege(email));
    setVerified(false);
    setPasswordSent(false);
  };

  const handleVerify = async () => {
    if (!collegeEmail || !detectedCollege) {
      alert("Please enter a valid college email first!");
      return;
    }
    setVerifying(true);
    await new Promise((res) => setTimeout(res, 2000));
    setVerifying(false);
    setVerified(true);
    setPasswordSent(true);
  };

  const handleIdUpload = (side: "front" | "back", file: File) => {
    const url = URL.createObjectURL(file);
    if (side === "front") { setIdFrontPreview(url); setIdFrontFile(file); }
    else { setIdBackPreview(url); setIdBackFile(file); }
  };

  const handleSignup = () => {
    if (!name || !gender || !collegeEmail || !detectedCollege || !branch || !phone || !state || !jeeMainsPercentile || !jeeMainsRank || !bio || !skills || !password) {
      alert("Please fill all required fields!");
      return;
    }
    if (!verified) { alert("Please verify your college email first!"); return; }
    if (!idFrontFile || !idBackFile) { alert("Please upload both sides of your college ID!"); return; }
    if (password !== confirmPassword) { alert("Passwords do not match!"); return; }
    console.log("Advisor signing up:", { name, gender, collegeEmail, detectedCollege, branch, phone, personalEmail, state, jeeMainsPercentile, jeeMainsRank, jeeAdvancedRank, bio, skills, achievements, languages, sessionPrice });
    // ✅ Redirect to advisor dashboard
    navigate({ to: "/advisor/dashboard" });
  };

  return (
    <AuthShell title="Advisor Sign Up" subtitle="Create your advisor account to start listing sessions.">
      <div className="flex flex-col gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Full Name <span className="text-neon-orange">•</span></label>
          <input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Gender <span className="text-neon-orange">•</span></label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">College Email <span className="text-neon-orange">•</span></label>
          <div className="flex gap-2">
            <input type="email" placeholder="you@college.edu.in" value={collegeEmail}
              onChange={handleEmailChange} disabled={verified}
              className={`flex-1 bg-background border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none transition-colors ${
                verified ? "border-green-500 text-green-400 cursor-not-allowed opacity-70"
                : detectedCollege ? "border-neon-orange focus:border-neon-orange"
                : "border-border focus:border-neon-orange"}`} />
            {!verified && (
              <button type="button" onClick={handleVerify} disabled={!detectedCollege || verifying}
                className="inline-flex items-center gap-2 bg-neon-orange hover:bg-neon-orange/80 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-xl px-4 py-2 text-sm transition-all duration-300">
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
            <p className="text-xs text-green-500 mt-1">✅ Email verified! Password has been sent to {collegeEmail}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">College <span className="text-neon-orange">•</span></label>
          <div className="relative">
            <input type="text" placeholder="Auto-detected from your email" value={detectedCollege} readOnly
              className={`w-full bg-background border rounded-xl px-4 py-2 text-sm transition-colors cursor-not-allowed ${
                detectedCollege ? "border-green-500 text-green-400" : "border-border text-muted-foreground"}`} />
            {detectedCollege && <CheckCircle size={16} className="absolute right-3 top-2.5 text-green-500" />}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Branch <span className="text-neon-orange">•</span></label>
          <input type="text" placeholder="e.g. Computer Science, Petroleum Engineering" value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Phone Number <span className="text-neon-orange">•</span></label>
          <input type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Personal Email <span className="text-xs">(optional)</span></label>
          <input type="email" placeholder="you@gmail.com" value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">State <span className="text-neon-orange">•</span></label>
          <select value={state} onChange={(e) => setState(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer">
            <option value="">Select your state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">JEE Mains <span className="text-neon-orange">•</span></label>
          <div className="flex gap-2">
            <input type="number" placeholder="Percentile (e.g. 98.5)" value={jeeMainsPercentile}
              onChange={(e) => setJeeMainsPercentile(e.target.value)}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
            <input type="number" placeholder="Rank" value={jeeMainsRank} onChange={(e) => setJeeMainsRank(e.target.value)}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">JEE Advanced Rank <span className="text-xs">(optional)</span></label>
          <input type="number" placeholder="Your JEE Advanced rank" value={jeeAdvancedRank}
            onChange={(e) => setJeeAdvancedRank(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
        </div>

        {/* College ID Upload */}
        <div className="border-t border-border/50 pt-4 mt-2">
          <p className="text-sm font-semibold text-foreground mb-1">🪪 College ID Card <span className="text-neon-orange">•</span></p>
          <p className="text-xs text-muted-foreground mb-4">Upload both sides of your college ID for verification.</p>
          <div className="flex gap-3">
            <ImageUploadBox label="Front Side" preview={idFrontPreview}
              onUpload={(file) => handleIdUpload("front", file)}
              onRemove={() => { setIdFrontPreview(null); setIdFrontFile(null); }} />
            <ImageUploadBox label="Back Side" preview={idBackPreview}
              onUpload={(file) => handleIdUpload("back", file)}
              onRemove={() => { setIdBackPreview(null); setIdBackFile(null); }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">🔒 Your ID is only used for verification and will not be shared publicly.</p>
        </div>

        {/* Bio Section */}
        <div className="border-t border-border/50 pt-4 mt-2">
          <p className="text-sm font-semibold text-foreground mb-4">📝 Your Profile Info</p>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm text-muted-foreground">Bio <span className="text-neon-orange">•</span></label>
            <textarea placeholder="Tell students about yourself..." value={bio} onChange={(e) => setBio(e.target.value)}
              rows={4} maxLength={500}
              className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors resize-none" />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm text-muted-foreground">Skills <span className="text-neon-orange">•</span></label>
            <input type="text" placeholder="e.g. Coding, Data Science, CAD, Public Speaking"
              value={skills} onChange={(e) => setSkills(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
            <p className="text-xs text-muted-foreground mt-1">Separate skills with commas</p>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm text-muted-foreground">Achievements <span className="text-xs">(optional)</span></label>
            <textarea placeholder="e.g. Smart India Hackathon winner, Dean's List..."
              value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={3}
              className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors resize-none" />
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm text-muted-foreground">Languages I speak <span className="text-xs">(optional)</span></label>
            <input type="text" placeholder="e.g. Hindi, English, Telugu"
              value={languages} onChange={(e) => setLanguages(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Session Price (₹) <span className="text-neon-orange">•</span></label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-sm text-muted-foreground">₹</span>
              <input type="number" placeholder="e.g. 499" value={sessionPrice} onChange={(e) => setSessionPrice(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">How much you charge per session</p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Password <span className="text-neon-orange">•</span></label>
          <input type="password" placeholder="Enter password sent by CollegeConnect"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Confirm Password <span className="text-neon-orange">•</span></label>
          <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors" />
        </div>

        <div className="mt-2">
          <Button onClick={handleSignup} disabled={!verified}
            className="w-full bg-neon-orange hover:bg-neon-orange/90 text-background font-semibold rounded-xl px-5 glow-orange transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            <UserPlus size={16} className="mr-2" />
            Create Account
          </Button>
          {!verified && (
            <p className="text-xs text-muted-foreground text-center mt-2">Please verify your college email to continue</p>
          )}
        </div>
      </div>
    </AuthShell>
  );
}