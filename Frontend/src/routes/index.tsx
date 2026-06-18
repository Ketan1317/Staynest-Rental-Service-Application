import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PropertyCard } from "@/components/PropertyCard";
import { Spinner } from "@/components/States";
import { PropertyAPI, unwrapList, type Property } from "@/lib/api";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [maxRent, setMaxRent] = useState("");

  useEffect(() => {
    let ignore = false;
    PropertyAPI.getAll()
      .then((res) => { if (!ignore) setProperties(unwrapList<Property>(res).slice(0, 6)); })
      .catch(() => {})
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      to: "/browse",
      search: {
        city: city || undefined,
        type: type || undefined,
        maxRent: maxRent ? Number(maxRent) : undefined,
      } as any,
    });
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-end pb-20 md:pb-24 px-6 md:px-10 pt-32">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Luxurious dark interior with marble floors and brass accents"
            width={1920}
            height={1080}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-obsidian/60 to-obsidian" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/85 via-obsidian/30 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto animate-fade-up">
          <div className="max-w-2xl mb-12 md:mb-16">
            <span className="text-brass text-[10px] uppercase tracking-[0.3em] mb-6 block font-medium">
              The StayNest Collection
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-medium leading-[1.02] tracking-tight text-balance mb-6 text-paper">
              Sanctuaries for the discerning.
            </h1>
            <p className="text-ash text-lg max-w-[50ch] leading-relaxed font-light">
              Curated PGs, private rooms and entire flats in the city's most sought-after districts. Strictly off-market.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="bg-surface/80 backdrop-blur-xl border border-white/5 p-2 inline-flex flex-col md:flex-row shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] w-full md:w-auto"
          >
            <div className="flex flex-col px-6 py-4 border-b md:border-b-0 md:border-r border-white/5 min-w-[220px]">
              <label className="text-[10px] uppercase tracking-widest text-ash mb-2 font-medium">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru, Mumbai…"
                className="bg-transparent text-paper text-sm focus:outline-none placeholder:text-ash/50"
              />
            </div>
            <div className="flex flex-col px-6 py-4 border-b md:border-b-0 md:border-r border-white/5 min-w-[180px]">
              <label className="text-[10px] uppercase tracking-widest text-ash mb-2 font-medium">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-transparent text-paper text-sm focus:outline-none cursor-pointer appearance-none"
              >
                <option value="" className="bg-charcoal">Any</option>
                <option value="PG" className="bg-charcoal">PG</option>
                <option value="ROOM" className="bg-charcoal">Room</option>
                <option value="FLAT" className="bg-charcoal">Flat</option>
              </select>
            </div>
            <div className="flex flex-col px-6 py-4 border-b md:border-b-0 md:border-r border-white/5 min-w-[180px]">
              <label className="text-[10px] uppercase tracking-widest text-ash mb-2 font-medium">Max rent</label>
              <input
                type="number"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                placeholder="₹40,000"
                className="bg-transparent text-paper text-sm focus:outline-none placeholder:text-ash/50"
              />
            </div>
            <div className="p-2">
              <button
                type="submit"
                className="bg-brass hover:bg-brass-hover text-obsidian px-10 py-4 h-full w-full md:w-auto text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors"
              >
                Inquire
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured */}
      <section className="px-6 md:px-10 py-24 md:py-32 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 md:mb-16 gap-4">
          <div>
            <span className="text-brass text-[10px] uppercase tracking-[0.3em] mb-4 block">The Collection</span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight">
              Recently acquired
            </h2>
          </div>
          <Link
            to="/browse"
            className="text-xs uppercase tracking-widest text-ash hover:text-paper border-b border-transparent hover:border-paper transition-all pb-1 self-start md:self-auto"
          >
            View portfolio →
          </Link>
        </div>

        {loading ? (
          <Spinner label="Curating" />
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ash font-light">No properties available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {properties.map((p) => <PropertyCard key={p._id} property={p} />)}
          </div>
        )}
      </section>

      {/* Value propositions */}
      <section className="border-t border-border px-6 md:px-10 py-24 max-w-[1440px] mx-auto">
        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {[
            { num: "01", title: "Curated, not crowded", body: "Every listing is hand-vetted. Quality over volume." },
            { num: "02", title: "Direct conversations", body: "Message owners in real time. No middlemen, no markup." },
            { num: "03", title: "Off-market access", body: "Discover residences before they hit public listings." },
          ].map((f) => (
            <div key={f.num}>
              <span className="font-serif text-brass text-3xl">{f.num}</span>
              <h3 className="font-serif text-2xl mt-3 mb-2">{f.title}</h3>
              <p className="text-ash font-light leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
