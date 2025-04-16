"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Command,
  GalleryVerticalEnd,
  Inbox,
  Newspaper,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/admin/nav-main";
import { NavUser } from "@/components/admin/nav-user";
import { TeamSwitcher } from "@/components/admin/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// ✅ Sidebar Data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "", // ✅ Empty avatar fallback handled in `NavUser`
  },
  teams: [
    {
      name: "AYALA",
      logo: GalleryVerticalEnd,
      plan: "Admin",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin/overview/dashboard",
        },
        {
          title: "Property Listing",
          url: "/admin/overview/listed-properties",
        },
        {
          title: "Job Listing",
          url: "/admin/overview/job-applications",
        },
        {
          title: "Job Applications",
          url: "/admin/overview/job-applicants",
        },
        {
          title: "Calendar",
          url: "/admin/overview/calendar/",
        },
      ],
    },
    {
      title: "Messages",
      url: "#",
      icon: Inbox,
      items: [
        {
          title: "Property Inquiries",
          url: "/admin/Inquiries-Appointments/property-inquiries",
        },
        {
          title: "Property Appointments",
          url: "/admin/Inquiries-Appointments/property-appointments",
        },
        {
          title: "General Inquiries",
          url: "/admin/overview/inquiries-received",
        },
      ],
    },
    {
      title: "Posting and Updates",
      url: "#",
      icon: Newspaper,
      items: [
        { title: "News Updates", url: "/admin/Posting/news-updates" },
        { title: "Services", url: "/admin/Posting/services" },
        { title: "About Us", url: "/admin/Posting/about-us" },
        { title: "Contact Details", url: "/admin/Posting/contact-details" },
        { title: "Testimonials", url: "/admin/Posting/testimonials" },
        { title: "FAQ", url: "/admin/Posting/faq" },
      ],
    },
  ],
};

// ✅ Sidebar Component
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ✅ Sidebar Header (Team Switcher) */}
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      {/* ✅ Sidebar Content (Main Navigation) */}
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      {/* ✅ Sidebar Footer (User Profile) */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      {/* ✅ Sidebar Rail (for collapsible mode) */}
      <SidebarRail />
    </Sidebar>
  );
}
