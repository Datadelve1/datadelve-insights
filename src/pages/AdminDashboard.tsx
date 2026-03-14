import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LogOut,
  Video,
  FileText,
  Users,
  Award,
  Bell,
  GraduationCap,
  Loader2,
  BarChart3,
} from "lucide-react";
import delvetekLogo from "@/assets/delvetek-logo.jpeg";

const AdminDashboard = () => {
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return <Navigate to="/auth" replace />;

  const adminModules = [
    {
      icon: Video,
      title: "Video Management",
      description: "Upload, edit, delete, and assign weekly videos to students.",
      color: "text-primary",
    },
    {
      icon: FileText,
      title: "Assignment Management",
      description: "Upload assignments, set correct answers, track submissions & auto-grade.",
      color: "text-primary",
    },
    {
      icon: Users,
      title: "Student Tracking",
      description: "View commitment forms, weekly reviews, scores, and course progress.",
      color: "text-primary",
    },
    {
      icon: GraduationCap,
      title: "Certificate Management",
      description: "Auto-generate, revoke, reissue, and bulk download certificates.",
      color: "text-primary",
    },
    {
      icon: Award,
      title: "Ambassador Program",
      description: "Track 8-week completions, unlock applications, and review submissions.",
      color: "text-primary",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Send emails for classes, reviews, assignments, and unlocked content.",
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={delvetekLogo} alt="Delvetek" className="h-10 w-auto rounded-lg" />
            <div>
              <span className="font-display font-bold text-xl text-foreground">
                Admin Portal
              </span>
              <p className="text-xs text-muted-foreground">DelveTek Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.full_name || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: "—", icon: Users },
            { label: "Recordings", value: "—", icon: Video },
            { label: "Assignments", value: "—", icon: FileText },
            { label: "Completion Rate", value: "—", icon: BarChart3 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-primary text-primary-foreground p-5 flex items-center gap-4"
            >
              <stat.icon className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">{stat.label}</p>
                <p className="font-display text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Modules Grid */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Management Modules
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((module) => (
              <Card
                key={module.title}
                className="border-border bg-card hover:border-primary/30 transition-all duration-300 cursor-pointer group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <module.icon className={`w-6 h-6 ${module.color}`} />
                    </div>
                    <CardTitle className="font-display text-lg text-foreground">
                      {module.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <p className="text-center text-muted-foreground text-sm">
          Full admin features are being built — module pages coming soon.
        </p>
      </main>
    </div>
  );
};

export default AdminDashboard;
