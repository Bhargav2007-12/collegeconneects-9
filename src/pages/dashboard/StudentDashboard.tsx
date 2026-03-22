import { useState } from "react";
import { BookOpen, MessageCircle, User, Calendar, Search, ChevronDown, Star, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const SAMPLE_ADVISORS = [
  { id: "a1", name: "Kartik Shukla", college: "RGIPT", branch: "Petroleum Engineering", year: 2, rating: 4.9, sessionPrice: 499 },
  { id: "a2", name: "Hitesh Sirvi", college: "RGIPT", branch: "Information Technology", year: 2, rating: 4.8, sessionPrice: 399 },
  { id: "a3", name: "Rohan Vishwakarma", college: "RGIPT", branch: "Electronics Engineering", year: 2, rating: 4.7, sessionPrice: 349 },
  { id: "a4", name: "Bhargav Venkat", college: "RGIPT", branch: "Mathematics and Computing", year: 2, rating: 4.9, sessionPrice: 549 },
  { id: "a5", name: "Kishan", college: "RGIPT", branch: "Mathematics and Computing", year: 2, rating: 4.6, sessionPrice: 299 },
  { id: "a6", name: "Yashwanth", college: "RGIPT", branch: "Mathematics and Computing", year: 2, rating: 4.8, sessionPrice: 449 },
];

const COLLEGES = ["All Colleges", "RGIPT", "IIT Delhi", "IIT Bombay", "NIT Trichy", "BITS Pilani"];
const BRANCHES = ["All Branches", "Computer Science", "Petroleum Engineering", "Information Technology", "Electronics Engineering", "Mathematics and Computing"];

const avatarColors = [
  "from-neon-orange to-orange-400",
  "from-neon-teal to-teal-400",
  "from-neon-blue to-blue-400",
  "from-purple-500 to-pink-500",
  "from-yellow-500 to-orange-500",
  "from-emerald-500 to-teal-500",
];

const TABS = [
  { id: "advisors", label: "Find Advisors", icon: Search },
  { id: "sessions", label: "My Sessions", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "profile", label: "My Profile", icon: User },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("advisors");
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
  document.title = "Student Dashboard — CollegeConnect";
}, []);

  // Mock student data
  const student = {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 98765 43210",
    state: "Uttar Pradesh",
    jeeMainsPercentile: "97.5",
    jeeMainsRank: "12500",
    academicStatus: "12th",
  };

  const filteredAdvisors = SAMPLE_ADVISORS.filter(a => {
    const collegeMatch = selectedCollege === "All Colleges" || a.college === selectedCollege;
    const branchMatch = selectedBranch === "All Branches" || a.branch === selectedBranch;
    const searchMatch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.college.toLowerCase().includes(searchQuery.toLowerCase()) || a.branch.toLowerCase().includes(searchQuery.toLowerCase());
    return collegeMatch && branchMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, <span className="gradient-text-orange">{student.name}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Find your perfect college advisor today</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-neon-teal text-black"
                  : "glass border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}

        {/* FIND ADVISORS TAB */}
        {activeTab === "advisors" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Search + Filters */}
            <div className="glass border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search advisors, colleges, branches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors appearance-none pr-8 cursor-pointer"
                >
                  {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors appearance-none pr-8 cursor-pointer"
                >
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Advisors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAdvisors.map((advisor, i) => {
                const initials = advisor.name.split(" ").map(n => n[0]).join("");
                return (
                  <motion.div
                    key={advisor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-2xl border border-border p-6 hover:border-neon-teal/40 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-lg font-bold text-white`}>
                        {initials}
                      </div>
                      <div className="flex items-center gap-1 glass rounded-full px-3 py-1">
                        <Star size={12} className="text-neon-orange fill-neon-orange" />
                        <span className="text-sm font-semibold">{advisor.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-1">{advisor.name}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen size={13} className="text-neon-teal" />
                      <span className="text-sm text-neon-teal">{advisor.college}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{advisor.branch}</p>
                    <p className="text-sm text-muted-foreground mb-4">Year {advisor.year}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">per session</p>
                        <p className="text-xl font-bold text-neon-orange">₹{advisor.sessionPrice}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-1 border border-neon-teal/40 text-neon-teal hover:bg-neon-teal/10 rounded-xl px-3 py-1.5 text-xs transition-all">
                          <MessageCircle size={12} />
                          Chat
                        </button>
                        <button className="inline-flex items-center gap-1 bg-neon-orange hover:bg-neon-orange/80 text-black rounded-xl px-3 py-1.5 text-xs font-semibold transition-all">
                          Book
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredAdvisors.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                No advisors found for your search.
              </div>
            )}
          </motion.div>
        )}

        {/* MY SESSIONS TAB */}
        {activeTab === "sessions" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-8 text-center"
          >
            <Calendar size={40} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No sessions yet</h3>
            <p className="text-muted-foreground mb-6">Book a session with an advisor to get started!</p>
            <button
              onClick={() => setActiveTab("advisors")}
              className="inline-flex items-center gap-2 bg-neon-teal hover:bg-neon-teal/80 text-black font-semibold rounded-xl px-6 py-2.5 text-sm transition-all"
            >
              Find Advisors
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-8 text-center"
          >
            <MessageCircle size={40} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-2">You can message up to <span className="text-neon-teal font-semibold">2 advisors for free</span></p>
            <p className="text-muted-foreground text-sm mb-6">Want to message more? Upgrade to premium.</p>
            <button
              onClick={() => setActiveTab("advisors")}
              className="inline-flex items-center gap-2 bg-neon-teal hover:bg-neon-teal/80 text-black font-semibold rounded-xl px-6 py-2.5 text-sm transition-all"
            >
              Find Advisors
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-6 sm:p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-teal to-teal-400 flex items-center justify-center text-2xl font-bold text-white">
                {student.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
                <p className="text-muted-foreground text-sm">Student</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Email", value: student.email },
                { label: "Phone", value: student.phone },
                { label: "State", value: student.state },
                { label: "Academic Status", value: student.academicStatus },
                { label: "JEE Mains Percentile", value: student.jeeMainsPercentile + "%" },
                { label: "JEE Mains Rank", value: student.jeeMainsRank },
              ].map(item => (
                <div key={item.label} className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-sm text-foreground font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            <button className="mt-6 inline-flex items-center gap-2 border border-neon-teal/40 text-neon-teal hover:bg-neon-teal/10 rounded-xl px-5 py-2.5 text-sm transition-all">
              Edit Profile
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}