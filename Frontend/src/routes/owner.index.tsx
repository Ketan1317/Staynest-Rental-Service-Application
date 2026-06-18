import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Spinner, EmptyState, ErrorState } from "@/components/States";
import { PropertyAPI, unwrapList, type Property } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatRent } from "@/lib/format";

export const Route = createFileRoute("/owner/")({
  component: OwnerDashboard,
  head: () => ({ meta: [{ title: "Owner dashboard — StayNest" }] }),
});

function OwnerDashboard() {
  const { isAuthed, user } = useAuth();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await PropertyAPI.getMine();
      setItems(unwrapList<Property>(res));
    } catch (e: any) { setError(e?.message ?? "Failed"); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (isAuthed) load(); else setLoading(false); }, [isAuthed]);

  async function remove(id: string) {
    if (!confirm("Delete this property?")) return;
    try { await PropertyAPI.remove(id); setItems((p) => p.filter((x) => x._id !== id)); }
    catch (e: any) { alert(e?.message ?? "Failed"); }
  }

  if (!isAuthed || user?.role !== "OWNER") {
    return <SiteLayout><EmptyState title="Owner access required" description="Sign in with an owner account to manage residences." action={
      <Link to="/login" className="inline-block bg-brass hover:bg-brass-hover text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold">Sign in</Link>
    } /></SiteLayout>;
  }

  return (
    <SiteLayout>
      <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-16 pb-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-brass text-[10px] uppercase tracking-[0.3em] mb-4 block">Owner</span>
            <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">Your residences</h1>
          </div>
          <Link to="/owner/new" className="bg-brass hover:bg-brass-hover text-obsidian px-6 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors">
            + List residence
          </Link>
        </div>

        {loading ? <Spinner label="Loading" />
          : error ? <ErrorState message={error} />
          : items.length === 0 ? <EmptyState title="No listings yet" description="Create your first listing to start receiving enquiries." action={
            <Link to="/owner/new" className="inline-block bg-brass hover:bg-brass-hover text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold">List a residence</Link>
          } />
          : (
            <ul className="divide-y divide-border border-y border-border">
              {items.map((p) => (
                <li key={p._id} className="flex items-center gap-6 py-5 px-2">
                  <div className="size-20 bg-surface overflow-hidden shrink-0 ring-1 ring-inset ring-white/5">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to="/property/$propertyId" params={{ propertyId: p._id }}
                      className="font-serif text-xl text-paper hover:text-brass transition-colors block truncate">
                      {p.title}
                    </Link>
                    <p className="text-ash text-sm font-light truncate">{p.city} · {p.propertyType}</p>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="font-serif text-xl text-paper tabular-nums">{formatRent(p.rent)}</p>
                    <p className="text-ash text-[10px] uppercase tracking-widest">/month</p>
                  </div>
                  <button onClick={() => remove(p._id)} className="text-[10px] uppercase tracking-[0.15em] text-ash hover:text-destructive border border-white/10 hover:border-destructive px-4 py-2 transition-colors">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
      </section>
    </SiteLayout>
  );
}
