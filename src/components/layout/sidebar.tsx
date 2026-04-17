"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  LayoutDashboard,
  Receipt,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/processors", label: "Processors", icon: Activity },
  { href: "/anomalies", label: "Anomalies", icon: AlertTriangle, badge: "1" },
  { href: "/routing", label: "Routing", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">Yuno</span>
          <span className="text-xs text-muted-foreground leading-tight">
            Orchestration
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.badge && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            VS
          </div>
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">Vadym S.</span>
            <span className="text-muted-foreground">Data Eng · Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
