"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArchiveIcon, BellIcon, CheckCheckIcon, InboxIcon, MessageCircleIcon } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { useNotifications, timeAgo, type AppNotification } from "@/lib/use-notifications";

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

type TabValue = "all" | "unread" | "archived";

interface NotificationContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
}

const NotificationContext = React.createContext<NotificationContextValue | undefined>(undefined);

function useNotificationPanel() {
  const ctx = React.useContext(NotificationContext);
  if (!ctx) throw new Error("useNotificationPanel must be used within provider");
  return ctx;
}

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);

  return (
    <NotificationContext.Provider value={{ open, setOpen, onClose: handleClose }}>
      <NotificationContent />
    </NotificationContext.Provider>
  );
}

function NotificationContent() {
  const isMobile = useIsMobile();
  if (isMobile) return <NotificationSheet />;
  return <NotificationPopover />;
}

// ─── Desktop Popover ───
function NotificationPopover() {
  const { open, setOpen } = useNotificationPanel();
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <TriggerButton />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className="z-50 w-96 rounded-lg border border-border bg-background shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden flex flex-col"
          style={{ maxHeight: "60dvh" }}
        >
          <NotificationTabs />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

// ─── Mobile Sheet ───
function NotificationSheet() {
  const { open, setOpen, onClose } = useNotificationPanel();

  return (
    <>
      <TriggerButton onClick={() => setOpen(true)} />
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div
              className="relative w-full max-w-sm bg-background rounded-xl border border-border shadow-lg overflow-hidden flex flex-col animate-in zoom-in-95 fade-in-0"
              style={{ maxHeight: "70dvh" }}
            >
              <NotificationTabs />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

// ─── Trigger Button ───
const TriggerButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  (props, ref) => {
    const { unreadCount } = useNotifications();
    return (
      <button
        ref={ref}
        {...props}
        className="relative inline-flex items-center justify-center rounded-md border border-border bg-background p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        aria-label="การแจ้งเตือน"
      >
        <BellIcon className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 pointer-events-none">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
            </span>
          </span>
        )}
      </button>
    );
  }
);
TriggerButton.displayName = "TriggerButton";

// ─── Tabs ───
function NotificationTabs() {
  const { onClose } = useNotificationPanel();
  const { notifications, markAllRead, markRead, archive } = useNotifications();
  const [tab, setTab] = React.useState<TabValue>("all");
  const [search, setSearch] = React.useState("");

  const active = notifications.filter((n) => !n.archived);
  const unread = active.filter((n) => !n.read);
  const archived = notifications.filter((n) => n.archived);
  const archivedFiltered = archived.filter((n) =>
    `${n.title} ${n.subtitle}`.toLowerCase().includes(search.toLowerCase())
  );

  function handleOpenItem(n: AppNotification) {
    markRead(n.id);
    onClose();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex justify-between items-center h-12 border-b border-border px-1 flex-shrink-0">
        <div className="flex h-full">
          {([
            { value: "all", label: "ทั้งหมด" },
            { value: "unread", label: "ยังไม่อ่าน" },
            { value: "archived", label: "เก็บถาวร" },
          ] as const).map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "px-4 h-full text-sm relative transition-colors hover:text-foreground",
                tab === t.value ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t.label}
              {t.value === "unread" && unread.length > 0 && (
                <span className="ml-1 text-[10px] font-bold text-rose-500">{unread.length}</span>
              )}
              {tab === t.value && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          ))}
        </div>
        {tab !== "archived" && unread.length > 0 && (
          <button
            onClick={markAllRead}
            title="ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"
            className="p-2 hover:bg-accent rounded-md mr-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckCheckIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Panels */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === "all" && (
          <NotificationList items={active} onOpen={handleOpenItem} onArchive={archive} />
        )}
        {tab === "unread" && (
          <NotificationList items={unread} onOpen={handleOpenItem} onArchive={archive} />
        )}
        {tab === "archived" && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาแจ้งเตือนที่เก็บถาวร..."
                className="w-full h-8 rounded-md bg-muted border-none px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {archivedFiltered.length === 0 ? (
              <div className="flex-1 flex justify-center items-center py-10">
                <span className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
                  <span className="bg-muted rounded-full p-3">
                    <ArchiveIcon className="h-5 w-5" />
                  </span>
                  ไม่มีแจ้งเตือนที่เก็บถาวร
                </span>
              </div>
            ) : (
              <NotificationList items={archivedFiltered} onOpen={handleOpenItem} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationList({
  items,
  onOpen,
  onArchive,
}: {
  items: AppNotification[];
  onOpen: (n: AppNotification) => void;
  onArchive?: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
        <span className="bg-muted rounded-full p-3">
          <InboxIcon className="h-5 w-5" />
        </span>
        ไม่มีการแจ้งเตือน
      </div>
    );
  }

  return (
    <ol className="list-none">
      {items.map((n) => (
        <li key={n.id} className="group border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
          <Link
            href={n.href ?? "#"}
            onClick={(e) => {
              if (!n.href) e.preventDefault();
              onOpen(n);
            }}
            className="flex items-center gap-3 p-3.5"
          >
            <MessageCircleIcon
              className={cn(
                "h-4 w-4 flex-shrink-0",
                n.read ? "text-muted-foreground" : "text-rose-500"
              )}
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className={cn("text-sm", !n.read && "font-semibold text-foreground")}>{n.title}</span>
              <span className="text-xs text-muted-foreground truncate">{n.subtitle}</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</span>
            </div>
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onArchive(n.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-accent transition-opacity flex-shrink-0"
                title="เก็บเข้าคลัง"
              >
                <ArchiveIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </Link>
        </li>
      ))}
    </ol>
  );
}
