import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PropertyCard } from "@/components/PropertyCard";
import { Spinner, EmptyState, ErrorState } from "@/components/States";
import { PropertyAPI, unwrapList, type Property } from "@/lib/api";

type Search = {
  city?: string;
  type?: string;
  minRent?: number;
  maxRent?: number;
};

export const Route = createFileRoute("/browse")({
  component: Browse,
  validateSearch: (search: Record<string, unknown>): Search => ({
    city: typeof search.city === "string" ? search.city : undefined,
    type: typeof search.type === "string" ? search.type : undefined,
    minRent: search.minRent ? Number(search.minRent) : undefined,
    maxRent: search.maxRent ? Number(search.maxRent) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse residences — StayNest" },
      { name: "description", content: "Search curated PGs, private rooms and flats by city, type and budget." },
    ],
  }),
});

function Browse() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [city, setCity] = useState(search.city ?? "");
  const [type, setType] = useState(search.type ?? "");
  const [minRent, setMinRent] = useState(search.minRent?.toString() ?? "");
  const [maxRent, setMaxRent] = useState(search.maxRent?.toString() ?? "");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    const hasFilter = !!(search.city || search.type || search.minRent || search.maxRent);
    const promise = hasFilter
      ? PropertyAPI.search({
          city: search.city,
          type: search.type,
          minRent: search.minRent,
          maxRent: search.maxRent,
        })
      : PropertyAPI.getAll();

    promise
      .then((res) => { if (!ignore) setItems(unwrapList<Property>(res)); })
      .catch((e) => { if (!ignore) setError(e?.message ?? "Failed to load properties"); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [search.city, search.type, search.minRent, search.maxRent]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      search: {
        city: city || undefined,
        type: type || undefined,
        minRent: minRent ? Number(minRent) : undefined,
        maxRent: maxRent ? Number(maxRent) : undefined,
      },
    });
  }

  function clear() {
    setCity(""); setType(""); setMinRent(""); setMaxRent("");
    navigate({ search: {} });
  }

  return (
    <SiteLayout>
      <section className="px-6 md:px-10 pt-16 pb-12 max-w-[1440px] mx-auto">
        <span className="text-brass text-[10px] uppercase tracking-[0.3em] mb-4 block">All Residences</span>
        <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight mb-10">
          Browse the collection
        </h1>

        <form
          onSubmit={applyFilters}
          className="bg-surface/60 border border-white/5 p-2 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-0"
        >
          <FilterInput label="City" value={city} onChange={setCity} placeholder="e.g. Pune" />
          <FilterSelect label="Type" value={type} onChange={setType}
            options={[{ v: "", l: "Any" }, { v: "PG", l: "PG" }, { v: "ROOM", l: "Room" }, { v: "FLAT", l: "Flat" }]} />
          <FilterInput label="Min rent" type="number" value={minRent} onChange={setMinRent} placeholder="₹" />
          <FilterInput label="Max rent" type="number" value={maxRent} onChange={setMaxRent} placeholder="₹" last />
          <div className="p-2">
            <button type="submit" className="h-full w-full bg-brass hover:bg-brass-hover text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors">
              Filter
            </button>
          </div>
          <div className="p-2">
            <button
              type="button"
              onClick={clear}
              className="h-full w-full px-6 py-3 text-[11px] uppercase tracking-[0.15em] text-ash hover:text-paper transition-colors border border-white/10 hover:border-white/30"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="px-6 md:px-10 pb-24 max-w-[1440px] mx-auto">
        {loading ? (
          <Spinner label="Loading" />
        ) : error ? (
          <ErrorState message={error} />
        ) : items.length === 0 ? (
          <EmptyState title="No residences match" description="Try widening your filters or clearing them." />
        ) : (
          <>
            <p className="text-ash text-xs uppercase tracking-widest mb-8">{items.length} residence{items.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {items.map((p) => <PropertyCard key={p._id} property={p} />)}
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function FilterInput({ label, value, onChange, placeholder, type = "text", last = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; last?: boolean;
}) {
  return (
    <div className={`flex flex-col px-5 py-3 border-b md:border-b-0 ${last ? "" : "md:border-r"} border-white/5`}>
      <label className="text-[10px] uppercase tracking-widest text-ash mb-1 font-medium">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="bg-transparent text-paper text-sm focus:outline-none placeholder:text-ash/40" />
    </div>
  );
}
function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[];
}) {
  return (
    <div className="flex flex-col px-5 py-3 border-b md:border-b-0 md:border-r border-white/5">
      <label className="text-[10px] uppercase tracking-widest text-ash mb-1 font-medium">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-paper text-sm focus:outline-none cursor-pointer appearance-none">
        {options.map((o) => <option key={o.v} value={o.v} className="bg-charcoal">{o.l}</option>)}
      </select>
    </div>
  );
}
