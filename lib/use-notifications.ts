"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { listJobs, listMyOffers, listMyAssignments } from "@/lib/api";

export type AppNotification = {
  id: string;
  title: string;
  subtitle: string;
  createdAt: string;
  read: boolean;
  archived: boolean;
  href?: string;
};

const POLL_INTERVAL_MS = 20000;
const MAX_STORED = 100;

type SeenState = {
  offerIds: string[];
  jobStatuses: Record<string, string>;
  assignmentStatuses: Record<string, string>;
};

const emptySeen = (): SeenState => ({ offerIds: [], jobStatuses: {}, assignmentStatuses: {} });

function notifKey(userId: string) {
  return `wemove_notifications_${userId}`;
}
function seenStateKey(userId: string) {
  return `wemove_notif_seen_${userId}`;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "เมื่อสักครู่";
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชม.ที่แล้ว`;
  const day = Math.floor(hr / 24);
  return `${day} วันที่แล้ว`;
}

export function useNotifications() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const seenRef = useRef<SeenState>(emptySeen());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setNotifications(readJSON(notifKey(user.id), []));
    seenRef.current = readJSON(seenStateKey(user.id), emptySeen());
    initializedRef.current = false;
  }, [user?.id]);

  const addNotification = useCallback(
    (title: string, subtitle: string, href?: string) => {
      if (!user) return;
      setNotifications((prev) => {
        const next = [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title,
            subtitle,
            createdAt: new Date().toISOString(),
            read: false,
            archived: false,
            href,
          },
          ...prev,
        ].slice(0, MAX_STORED);
        localStorage.setItem(notifKey(user.id), JSON.stringify(next));
        return next;
      });
    },
    [user?.id]
  );

  const poll = useCallback(async () => {
    if (!user || !token) return;
    const seen = seenRef.current;

    if (user.role === "driver") {
      const [offers, assignments] = await Promise.all([
        listMyOffers(token).catch(() => []),
        listMyAssignments(token).catch(() => []),
      ]);

      const nextOfferIds: string[] = [];
      (offers ?? [])
        .filter((o) => o.offerStatus === "pending")
        .forEach((o) => {
          nextOfferIds.push(o.id);
          if (initializedRef.current && !seen.offerIds.includes(o.id)) {
            addNotification("มีงานเสนอเข้ามาใหม่", "มีคนเสนองานให้คุณ กดดูที่เมนู \"งานที่รับได้\"", "/driver/jobs");
          }
        });

      const nextAssignmentStatuses: Record<string, string> = {};
      (assignments ?? []).forEach((a) => {
        const prevStatus = seen.assignmentStatuses[a.id];
        if (initializedRef.current && prevStatus && prevStatus !== "completed" && a.status === "completed") {
          addNotification("จัดส่งสำเร็จ", "งานที่คุณรับไว้เสร็จสมบูรณ์แล้ว", "/driver/my-jobs");
        }
        nextAssignmentStatuses[a.id] = a.status;
      });

      seenRef.current = { ...seen, offerIds: nextOfferIds, assignmentStatuses: nextAssignmentStatuses };
    } else {
      const jobs = await listJobs(token).catch(() => []);
      const nextJobStatuses: Record<string, string> = {};
      (jobs ?? []).forEach((j) => {
        const prevStatus = seen.jobStatuses[j.id];
        if (initializedRef.current && prevStatus) {
          if (prevStatus === "open" && j.status === "assigned") {
            addNotification("มีคนขับรับงานของคุณ", j.title, `/jobs/${j.id}`);
          } else if (prevStatus !== "completed" && j.status === "completed") {
            addNotification("งานเสร็จสมบูรณ์", j.title, `/jobs/${j.id}`);
          }
        }
        nextJobStatuses[j.id] = j.status;
      });
      seenRef.current = { ...seen, jobStatuses: nextJobStatuses };
    }

    localStorage.setItem(seenStateKey(user.id), JSON.stringify(seenRef.current));
    initializedRef.current = true;
  }, [user, token, addNotification]);

  useEffect(() => {
    if (!user || !token) return;
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, token, poll]);

  const markAllRead = useCallback(() => {
    if (!user) return;
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem(notifKey(user.id), JSON.stringify(next));
      return next;
    });
  }, [user?.id]);

  const markRead = useCallback(
    (id: string) => {
      if (!user) return;
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        localStorage.setItem(notifKey(user.id), JSON.stringify(next));
        return next;
      });
    },
    [user?.id]
  );

  const archive = useCallback(
    (id: string) => {
      if (!user) return;
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, archived: true, read: true } : n));
        localStorage.setItem(notifKey(user.id), JSON.stringify(next));
        return next;
      });
    },
    [user?.id]
  );

  const unreadCount = notifications.filter((n) => !n.read && !n.archived).length;

  return { notifications, unreadCount, markAllRead, markRead, archive };
}
