/** Admin portal menu: grouped in plain words, shared by the sidebar, the page header and the home page shortcuts. */
import {
  LayoutDashboard, ClipboardList, Users, GraduationCap, Video, FileText, Database, FileVideo,
  Share2, BarChart3, MessageSquare, ShieldCheck, Clock, HardDrive, type LucideIcon,
} from "lucide-react";

export const SUPER_ADMIN_EMAIL = "datadelve1@gmail.com";

export interface AdminNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  description: string;
  superAdminOnly?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Start here",
    items: [{ title: "Home", url: "/admin/dashboard", icon: LayoutDashboard, description: "Quick view of the selected cohort" }],
  },
  {
    label: "Students",
    items: [
      { title: "Enrollments & Payments", url: "/admin/enrollments", icon: ClipboardList, description: "New sign-ups, payments and confirmations" },
      { title: "Student Progress", url: "/admin/students", icon: Users, description: "Who is keeping up and who needs a nudge" },
      { title: "Certificates", url: "/admin/certificates", icon: GraduationCap, description: "Certificate requests and payments" },
    ],
  },
  {
    label: "Classes",
    items: [
      { title: "Class Recordings", url: "/admin/videos", icon: Video, description: "Upload each week's class videos" },
      { title: "Assignments", url: "/admin/assignments", icon: FileText, description: "Add assignments and see submissions" },
      { title: "Practice Datasets", url: "/admin/datasets", icon: Database, description: "Data files for the SQL practice area" },
      { title: "Student Video Uploads", url: "/admin/student-videos", icon: FileVideo, description: "Videos students have sent in" },
    ],
  },
  {
    label: "Growth & reports",
    items: [
      { title: "Ambassadors", url: "/admin/ambassadors", icon: Share2, description: "Referral codes and who brought students in" },
      { title: "Weekly Reports", url: "/admin/reports", icon: BarChart3, description: "Week-by-week numbers" },
      { title: "Review Questions", url: "/admin/review-questions", icon: MessageSquare, description: "Questions for student reviews (reviews are paused)" },
    ],
  },
  {
    label: "Team",
    items: [
      { title: "Operations Centre", url: "/staff/ops", icon: ShieldCheck, description: "David's tasks: pending or done" },
      { title: "Staff Tracking", url: "/admin/staff", icon: Clock, description: "Staff hours and activity", superAdminOnly: true },
    ],
  },
  {
    label: "Files",
    items: [{ title: "Storage", url: "/admin/storage", icon: HardDrive, description: "Uploaded files and space used" }],
  },
];

export function adminNavFor(email?: string | null): AdminNavGroup[] {
  const isSuper = email === SUPER_ADMIN_EMAIL;
  return ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.superAdminOnly || isSuper) })).filter((g) => g.items.length > 0);
}

export function findAdminNavItem(pathname: string): AdminNavItem | undefined {
  const path = pathname.replace(/\/+$/, "");
  for (const g of ADMIN_NAV) for (const i of g.items) if (i.url === path) return i;
  if (path === "/admin/referrers") return findAdminNavItem("/admin/ambassadors");
  return undefined;
}
