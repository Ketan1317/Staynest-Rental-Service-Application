import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PropertyCard } from "@/components/PropertyCard";
import { Spinner, EmptyState, ErrorState } from "@/components/States";
import { PropertyAPI, unwrapList, type Property } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/favorites")({
  component: Favorites,
  head: () => ({ meta: [{ title: "Favorites — StayNest" }] }),
});

function Favorites() {
  const { isAuthed } = useAuth();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthed) { setLoading(false); return; }
    let ignore = false;
    PropertyAPI.getFavs()
      .then((res) => { if (!ignore) setItems(unwrapList<Property>(res)); })
      .catch((e) => { if (!ignore) setError(e?.message ?? "Failed to load"); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [isAuthed]);

  return (
    <SiteLayout>
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 pt-16 pb-24">
        <span className="text-brass text-[10px] uppercase tracking-[0.3em] mb-4 block">Saved</span>
        <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight mb-12">Your favorites</h1>

        {!isAuthed ? (
          <EmptyState title="Sign in to view favorites" action={
            <Link to="/login" className="inline-block bg-brass hover:bg-brass-hover text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold">Sign in</Link>
          } />
        ) : loading ? <Spinner label="Loading" />
          : error ? <ErrorState message={error} />
          : items.length === 0 ? (
            <EmptyState title="No favorites yet" description="Tap the heart on any residence to save it here." action={
              <Link to="/browse" className="inline-block bg-brass hover:bg-brass-hover text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold">Browse</Link>
            } />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {items.map((p) => <PropertyCard key={p._id} property={p} initialFav />)}
            </div>
          )}
      </section>
    </SiteLayout>
  );
}
