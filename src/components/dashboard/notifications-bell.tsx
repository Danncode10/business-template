"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { listNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/services/notifications";
import type { DashboardTabId } from "@/lib/dashboard-features";

interface NotificationsBellProps {
  setTab: (tab: DashboardTabId) => void;
}

export function NotificationsBell({ setTab }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: unread } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });

  const { data: items } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotifications(15),
    enabled: open,
  });

  const markReadMut = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleClickItem = (id: string, link: string | null) => {
    markReadMut.mutate(id);
    if (link?.startsWith("/dashboard?tab=")) {
      const tab = link.split("=")[1] as DashboardTabId;
      setTab(tab);
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" strokeWidth={1.5} />
        {!!unread && unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-[13px] font-semibold text-foreground">Notifications</p>
            {!!unread && unread > 0 && (
              <button
                onClick={() => markAllMut.mutate()}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {(items ?? []).length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Inbox className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-[12px] text-muted-foreground">No notifications yet.</p>
              </div>
            ) : (
              (items ?? []).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickItem(n.id, n.link)}
                  className={`w-full px-4 py-3 text-left border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                    !n.is_read ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">{n.title}</p>
                      {n.body && <p className="text-[12px] text-muted-foreground truncate">{n.body}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
