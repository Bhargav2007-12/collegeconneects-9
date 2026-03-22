import { useState } from "react";
import { MessageCircle, User, Calendar, IndianRupee, Star, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

const TABS = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "sessions", label: "My Sessions", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "earnings", label: "Earnings", icon: IndianRupee },
  { id: "profile", label: "My Profile", icon: User },
];

export default function AdvisorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
useEffect(() => {
  document.title = "Advisor Dashboard — CollegeConnect";
}, []);
  // Mock advisor data
  const advisor = {
    name: "Kartik Shukla",
    college: "RGIPT",
    branch: "Petroleum Engineering",
    year: 2,
    rating: 4.9,
    sessionPrice: 499,
    bio: "Hey! I'm Kartik from RGIPT. I love helping students make the right college choice.",
    skills: "Petroleum Engineering, Research, CAD",
    achievements: "Smart India Hackathon finalist, Dean's List",
    languages: "Hindi, English",
    totalEarnings: 4990,
    totalSessions: 10,
    totalStudents: 8,
  };

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
            Welcome back, <span className="gradient-text-orange">{advisor.name}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Manage your sessions and connect with students</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-neon-orange text-black"
                  : "glass border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Earnings", value: `₹${advisor.totalEarnings}`, icon: IndianRupee, color: "text-neon-orange" },
                { label: "Total Sessions", value: advisor.totalSessions, icon: Calendar, color: "text-neon-teal" },
                { label: "Students Helped", value: advisor.totalStudents, icon: Users, color: "text-neon-blue" },
              ].map(stat => (
                <div key={stat.label} className="glass rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon size={20} className={stat.color} />
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="glass rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-3">
                <Star size={20} className="text-neon-orange fill-neon-orange" />
                <p className="text-sm text-muted-foreground">Your Rating</p>
              </div>
              <p className="text-3xl font-bold text-neon-orange mt-2">{advisor.rating} / 5.0</p>
              <p className="text-xs text-muted-foreground mt-1">Based on {advisor.totalSessions} sessions</p>
            </div>

            {/* Quick info */}
            <div className="glass rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Your Profile Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "College", value: advisor.college },
                  { label: "Branch", value: advisor.branch },
                  { label: "Year", value: `Year ${advisor.year}` },
                  { label: "Session Price", value: `₹${advisor.sessionPrice}` },
                  { label: "Languages", value: advisor.languages },
                  { label: "Skills", value: advisor.skills },
                ].map(item => (
                  <div key={item.label} className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm text-foreground font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === "sessions" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-8 text-center"
          >
            <Calendar size={40} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No sessions booked yet</h3>
            <p className="text-muted-foreground">Students will book sessions with you once your profile is live!</p>
          </motion.div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-8 text-center"
          >
            <MessageCircle size={40} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No messages yet</h3>
            <p className="text-muted-foreground">Students will message you once your profile is live!</p>
          </motion.div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === "earnings" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="glass rounded-2xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
                <p className="text-4xl font-display font-bold text-neon-orange">₹{advisor.totalEarnings}</p>
              </div>
              <div className="glass rounded-2xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">Per Session</p>
                <p className="text-4xl font-display font-bold text-neon-teal">₹{advisor.sessionPrice}</p>
              </div>
            </div>
            <div className="glass rounded-2xl border border-border p-8 text-center">
              <IndianRupee size={40} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No transactions yet</h3>
              <p className="text-muted-foreground">Your earnings will show here once students book sessions!</p>
            </div>
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-6 sm:p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-orange to-orange-400 flex items-center justify-center text-2xl font-bold text-white">
                {advisor.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{advisor.name}</h2>
                <p className="text-muted-foreground text-sm">{advisor.college} • {advisor.branch}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Bio</p>
                <p className="text-sm text-foreground">{advisor.bio}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Skills", value: advisor.skills },
                  { label: "Achievements", value: advisor.achievements },
                  { label: "Languages", value: advisor.languages },
                  { label: "Session Price", value: `₹${advisor.sessionPrice}` },
                ].map(item => (
                  <div key={item.label} className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm text-foreground font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-6 inline-flex items-center gap-2 border border-neon-orange/40 text-neon-orange hover:bg-neon-orange/10 rounded-xl px-5 py-2.5 text-sm transition-all">
              Edit Profile
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}