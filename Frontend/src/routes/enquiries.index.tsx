import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Spinner, EmptyState, ErrorState } from "@/components/States";
import { EnquiryAPI, unwrapList, type Enquiry } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/enquiries/")({
  component: EnquiriesIndex,
  head: () => ({ meta: [{ title: "Enquiries — StayNest" }] }),
});

function EnquiriesIndex() {
  const { isAuthed, user } = useAuth();
  const [tab, setTab] = useState<"USER" | "OWNER">("USER");
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthed) { setLoading(false); return; }
    let ignore = false;
    setLoading(true); setError(null);
    const fetcher = tab === "OWNER" ? EnquiryAPI.owner() : EnquiryAPI.user();
    fetcher
      .then((res) => { if (!ignore) setItems(unwrapList<Enquiry>(res)); })
      .catch((e) => { if (!ignore) setError(e?.message ?? "Failed to load"); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [isAuthed, tab]);

  if (!isAuthed) {
    return (
      <SiteLayout>
        <EmptyState title="Sign in to view enquiries" action={
          <Link to="/login" className="inline-block bg-brass hover:bg-brass-hover text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold">Sign in</Link>
        } />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pt-16 pb-24">
        <span className="text-brass text-[10px] uppercase tracking-[0.3em] mb-4 block">Conversations</span>
        <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight mb-10">Enquiries</h1>

        {user?.role === "OWNER" && (
          <div className="inline-flex border border-white/10 mb-10">
            {(["USER", "OWNER"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-3 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                  tab === t ? "bg-brass text-obsidian font-semibold" : "text-paper/70 hover:text-paper"
                }`}>
                {t === "USER" ? "Sent" : "Received"}
              </button>
            ))}
          </div>
        )}

        {loading ? <Spinner label="Loading" />
          : error ? <ErrorState message={error} />
          : items.length === 0 ? (
            <EmptyState title="No enquiries" description="Start a conversation by enquiring on any residence." action={
              <Link to="/browse" className="inline-block bg-brass hover:bg-brass-hover text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold">Browse</Link>
            } />
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {/* {console.log(items)} */}
              {items.map((e) => {
                // console.log("TYPE:", typeof e.propertyId);
                
                const prop = typeof e.propertyId === "object" ? e.propertyId : null;

                console.log("okok"+prop);
                const unread = tab === "OWNER" ? e.unreadCount?.owner : e.unreadCount?.user;
                return (
                  <li key={e._id}>
                    <Link to="/enquiries/$enquiryId" params={{ enquiryId: e._id }}
                      className="flex items-center justify-between gap-6 py-6 group hover:bg-surface/40 transition-colors px-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-serif text-xl text-paper group-hover:text-brass transition-colors truncate">
                            {e?.ownerId.name ?? "Property"}
                          </h3>
                          <StatusPill status={e.status} />
                        </div>
                        <p className="text-ash text-sm font-light truncate">
                          {prop?.city ? `${prop.city} · ` : ""}{e.lastMessage ?? "No messages yet"}
                        </p>
                      </div>
                      {!!unread && (
                        <span className="shrink-0 min-w-[22px] h-[22px] px-2 rounded-full bg-brass text-obsidian text-[10px] font-semibold flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
      </section>
    </SiteLayout>
  );
}

function StatusPill({ status }: { status: Enquiry["status"] }) {
  const styles = {
    PENDING: "border-ash/30 text-ash",
    RESPONDED: "border-brass/40 text-brass",
    CLOSED: "border-white/10 text-ash/60",
  }[status];
  return (
    <span className={`text-[9px] uppercase tracking-[0.2em] border px-2 py-0.5 ${styles}`}>{status}</span>
  );
}
