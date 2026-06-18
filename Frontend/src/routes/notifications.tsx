import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Spinner, EmptyState, ErrorState } from "@/components/States";
import { NotificationAPI, unwrapList } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Notif = {
  _id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEnquiryId?: any;
  relatedPropertyId?: any;
};

export const Route = createFileRoute("/notifications")({
  component: Notifications,
  head: () => ({ meta: [{ title: "Notifications — StayNest" }] }),
});

function Notifications() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await NotificationAPI.list();
      setItems(unwrapList<Notif>(res));
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthed) load();
    else setLoading(false);
  }, [isAuthed]);

  async function markAll() {
    await NotificationAPI.readAll();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function markOne(id: string) {
    await NotificationAPI.read(id);
    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  }

  // ✅ HANDLE CLICK (MAIN FIX)
  async function handleClick(n: Notif) {
    if (!n.isRead) await markOne(n._id);

    // 👉 navigate to enquiry
    if (n.relatedEnquiryId) {
      const id =
        typeof n.relatedEnquiryId === "object"
          ? n.relatedEnquiryId._id
          : n.relatedEnquiryId;

      navigate({
        to: "/enquiries/$enquiryId",
        params: { enquiryId: id },
      });
      return;
    }

    // 👉 navigate to property
    if (n.relatedPropertyId) {
      const id =
        typeof n.relatedPropertyId === "object"
          ? n.relatedPropertyId._id
          : n.relatedPropertyId;

      navigate({
        to: "/property/$propertyId",
        params: { propertyId: id },
      });
    }
  }

  if (!isAuthed) {
    return (
      <SiteLayout>
        <EmptyState
          title="Sign in to view notifications"
          action={
            <Link
              to="/login"
              className="inline-block bg-brass hover:bg-brass-hover text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold"
            >
              Sign in
            </Link>
          }
        />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-6 md:px-10 pt-16 pb-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-brass text-[10px] uppercase tracking-[0.3em] mb-4 block">
              Inbox
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">
              Notifications
            </h1>
          </div>

          {items.some((i) => !i.isRead) && (
            <button
              onClick={markAll}
              className="text-[10px] uppercase tracking-[0.15em] text-ash hover:text-brass border-b border-transparent hover:border-brass pb-1 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <Spinner label="Loading" />
        ) : error ? (
          <ErrorState message={error} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You'll see enquiry replies and updates here."
          />
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {items.map((n) => (
              <li
                key={n._id}
                onClick={() => handleClick(n)}   // ✅ FIXED
                className={`py-5 px-2 flex items-start gap-4 cursor-pointer hover:bg-surface/40 transition-colors ${
                  !n.isRead ? "bg-surface/20" : ""
                }`}
              >
                <span
                  className={`mt-2 size-2 rounded-full shrink-0 ${
                    !n.isRead ? "bg-brass" : "bg-white/10"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-brass mb-1">
                    {n.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-paper font-light">{n.message}</p>
                  <p className="text-ash text-xs mt-1 font-light">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </SiteLayout>
  );
}