"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Building2, User as UserIcon, Shield } from "lucide-react";
import { getProfile } from "@/services/users";
import { ProfileForm } from "@/components/profile-form";
import { SecurityForm } from "@/components/security-form";
import { siteConfig } from "@/lib/config";
import businessConfig from "../../../../business.json";
import { useState } from "react";

const SECTIONS = [
  { id: "profile",  label: "Profile",      icon: UserIcon },
  { id: "security", label: "Security",     icon: Shield },
  { id: "org",      label: "Organization", icon: Building2 },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

export function SettingsTab() {
  const [section, setSection] = useState<SectionId>("profile");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profiles-db"],
    queryFn: getProfile,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Account, security, and organization preferences.
        </p>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
              section === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin inline" />
        ) : section === "profile" ? (
          <ProfileForm profile={profile} />
        ) : section === "security" ? (
          <SecurityForm />
        ) : (
          <OrganizationPanel />
        )}
      </div>
    </div>
  );
}

function OrganizationPanel() {
  const sb = businessConfig.supabase as { organizationSlug?: string; projectRef?: string; projectName?: string };
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-black text-foreground tracking-tighter uppercase italic">
          Organization
        </h3>
        <p className="text-sm text-muted-foreground italic">
          Read-only summary of your tenant configuration.
        </p>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
        <Field label="Business name" value={siteConfig.name} />
        <Field label="App ID" value={businessConfig.deployment.appId} />
        <Field label="Org slug" value={sb.organizationSlug ?? "—"} />
        <Field label="Supabase project" value={sb.projectName ?? sb.projectRef ?? "—"} />
        <Field label="Website" value={siteConfig.url} />
        <Field label="Industry" value={businessConfig.business.industry} />
        <Field label="Contact email" value={siteConfig.contact.email} />
        <Field label="Address" value={siteConfig.contact.address} />
      </dl>

      <div className="border-t border-border pt-4 text-[12px] text-muted-foreground">
        Edit these in <code>business.json</code> at the repo root.
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background border border-border rounded-xl px-4 py-3">
      <dt className="text-[10px] font-mono font-black uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium text-foreground truncate">{value}</dd>
    </div>
  );
}
