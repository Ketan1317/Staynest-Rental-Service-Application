import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Spinner, ErrorState } from "@/components/States";
import { PropertyAPI, EnquiryAPI, unwrapList, type Property } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatRent, getOwnerId } from "@/lib/format";

export const Route = createFileRoute("/property/$propertyId")({
  component: PropertyDetail,
});

function PropertyDetail() {
  const { propertyId } = Route.useParams();
  const { isAuthed, user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  const [enquiring, setEnquiring] = useState(false);
  const [enquireMsg, setEnquireMsg] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    PropertyAPI.getAll()
      .then((res) => {
        const list = unwrapList<Property>(res);
        const found = list.find((p) => p._id === propertyId) ?? null;
        if (!ignore) setProperty(found);
        if (!ignore && !found) setError("Property not found");
      })
      .catch((e) => { if (!ignore) setError(e?.message ?? "Failed to load"); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [propertyId]);

  async function handleEnquire() {
    if (!isAuthed) { navigate({ to: "/login" }); return; }
    setEnquiring(true); setEnquireMsg(null);
    try {
      const res = await EnquiryAPI.create(propertyId);
      const enquiryId = res?.data?._id || res?.enquiry?._id || res?._id;
      if (enquiryId) navigate({ to: "/enquiries/$enquiryId", params: { enquiryId } });
      else setEnquireMsg("Enquiry created.");
    } catch (e: any) {
      setEnquireMsg(e?.message ?? "Could not create enquiry");
    } finally {
      setEnquiring(false);
    }
  }

  if (loading) return <SiteLayout><Spinner label="Loading" /></SiteLayout>;
  if (error || !property) return <SiteLayout><ErrorState message={error ?? "Not found"} /></SiteLayout>;

  const images = property.images?.length ? property.images : [`https://picsum.photos/seed/${property._id}/1200/800?grayscale`];
  const isOwner = user?.id && getOwnerId(property.ownerId) === user.id;

  return (
    <SiteLayout>
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 pt-10">
        <Link to="/browse" className="text-xs uppercase tracking-widest text-ash hover:text-brass transition-colors">
          ← Back to collection
        </Link>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 md:px-10 pt-8 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-16">
        <div>
          <div className="aspect-[4/3] bg-surface overflow-hidden ring-1 ring-inset ring-white/5">
            <img src={images[activeImg]} alt={property.title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-2">
              {images.slice(0, 5).map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden ring-1 ring-inset ${i === activeImg ? "ring-brass" : "ring-white/5 hover:ring-white/20"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="flex flex-col">
          <span className="text-brass text-[10px] uppercase tracking-[0.3em] mb-3">{property.propertyType}</span>
          <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight leading-tight mb-3 text-balance">
            {property.title}
          </h1>
          <p className="text-ash font-light mb-8">{property.address}, {property.city}</p>

          <div className="border-y border-border py-6 my-2">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-4xl text-paper tabular-nums">{formatRent(property.rent)}</span>
              <span className="text-ash text-sm font-light">/ month</span>
            </div>
            {property.deposit !== undefined && (
              <p className="text-ash text-xs mt-2 uppercase tracking-widest">
                Deposit: <span className="text-paper">{formatRent(property.deposit)}</span>
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-y-4 my-6 text-sm">
            {property.sharingType && <Detail label="Sharing" value={property.sharingType} />}
            {property.genderPreference && <Detail label="Preference" value={property.genderPreference} />}
          </dl>

          {!isOwner && (
            <button
              onClick={handleEnquire}
              disabled={enquiring}
              className="mt-2 bg-brass hover:bg-brass-hover disabled:opacity-50 text-obsidian py-4 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors"
            >
              {enquiring ? "Sending…" : "Enquire about this residence"}
            </button>
          )}
          {enquireMsg && <p className="text-xs text-ash mt-3">{enquireMsg}</p>}
        </aside>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 md:px-10 mt-20 mb-24 grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="font-serif text-3xl mb-4">About this residence</h2>
          <p className="text-paper/85 font-light leading-relaxed whitespace-pre-line">{property.description}</p>
        </div>
        <div className="space-y-10">
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="text-brass text-[10px] uppercase tracking-[0.3em] mb-4">Amenities</h3>
              <ul className="grid grid-cols-2 gap-y-2 text-sm text-paper/85 font-light">
                {property.amenities.map((a, i) => <li key={i}>· {a}</li>)}
              </ul>
            </div>
          )}
          {property.rules && property.rules.length > 0 && (
            <div>
              <h3 className="text-brass text-[10px] uppercase tracking-[0.3em] mb-4">House rules</h3>
              <ul className="space-y-2 text-sm text-paper/85 font-light">
                {property.rules.map((r, i) => <li key={i}>· {r}</li>)}
              </ul>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-ash">{label}</dt>
      <dd className="text-paper mt-1">{value}</dd>
    </div>
  );
}
