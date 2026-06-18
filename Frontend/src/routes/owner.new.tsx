import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PropertyAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/owner/new")({
  component: NewProperty,
  head: () => ({ meta: [{ title: "List a residence — StayNest" }] }),
});

function NewProperty() {
  const { isAuthed, user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState<"PG" | "ROOM" | "FLAT">("FLAT");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [sharingType, setSharingType] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [amenities, setAmenities] = useState("");
  const [rules, setRules] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthed || user?.role !== "OWNER") {
    return (
      <SiteLayout>
        <div className="px-10 py-20 text-center text-ash">Owner access required.</div>
      </SiteLayout>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (description.length < 20) {
      setError("Description must be at least 20 characters.");
      return;
    }
    if (images.length === 0) {
      setError("Add at least one image.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("propertyType", propertyType);
      fd.append("address", address);
      fd.append("city", city);
      fd.append("rent", rent);
      if (deposit) fd.append("deposit", deposit);
      if (sharingType) fd.append("sharingType", sharingType);
      if (genderPreference) fd.append("genderPreference", genderPreference);
      amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((a) => fd.append("amenities", a));
      rules
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((r) => fd.append("rules", r));
      images.forEach((f) => fd.append("images", f));
      await PropertyAPI.create(fd);
      navigate({ to: "/owner" });
    } catch (e: any) {
      setError(e?.message ?? "Creation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="max-w-2xl mx-auto px-6 md:px-10 py-16">
        <span className="text-brass text-[10px] uppercase tracking-[0.3em]">New listing</span>
        <h1 className="font-serif text-4xl md:text-5xl mt-3 mb-10">List a residence</h1>

        <form onSubmit={submit} className="space-y-5">
          <Field label="Title" value={title} onChange={setTitle} required />

          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-ash">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              maxLength={2000}
              rows={5}
              className="mt-2 w-full bg-surface/60 border border-white/10 px-4 py-3 text-paper focus:border-brass focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-ash/60 mt-1 block">
              {description.length}/2000 (min 20)
            </span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-ash">Type</span>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="mt-2 w-full bg-surface/60 border border-white/10 px-4 py-3 text-paper focus:border-brass focus:outline-none transition-colors"
              >
                <option value="PG" className="bg-charcoal">
                  PG
                </option>
                <option value="ROOM" className="bg-charcoal">
                  Room
                </option>
                <option value="FLAT" className="bg-charcoal">
                  Flat
                </option>
              </select>
            </label>
            <Field label="City" value={city} onChange={setCity} required />
          </div>

          <Field label="Address" value={address} onChange={setAddress} required />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Rent (₹/mo)" type="number" value={rent} onChange={setRent} required />
            <Field label="Deposit (₹)" type="number" value={deposit} onChange={setDeposit} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              type="number"
              label="Sharing"
              value={sharingType}
              onChange={setSharingType}
              placeholder="1,2,3..."
            />
            <Field
              label="Gender preference"
              value={genderPreference}
              onChange={(val) => setGenderPreference(val.toUpperCase())}
              placeholder="ANY, MALE, FEMALE"
            />
          </div>

          <Field
            label="Amenities (comma-separated)"
            value={amenities}
            onChange={setAmenities}
            placeholder="Wifi, AC, Parking"
          />
          <Field
            label="Rules (comma-separated)"
            value={rules}
            onChange={setRules}
            placeholder="No smoking, No pets"
          />

          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-ash">Images (1–10)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files ?? []).slice(0, 10))}
              className="mt-2 w-full text-sm text-paper/80 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-surface file:text-paper file:text-xs file:uppercase file:tracking-widest file:cursor-pointer"
            />
            {images.length > 0 && (
              <span className="text-[10px] text-ash/60 mt-1 block">{images.length} selected</span>
            )}
          </label>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            disabled={busy}
            className="w-full bg-brass hover:bg-brass-hover text-obsidian py-4 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors disabled:opacity-50"
          >
            {busy ? "Publishing…" : "Publish residence"}
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-ash">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-surface/60 border border-white/10 px-4 py-3 text-paper focus:border-brass focus:outline-none transition-colors placeholder:text-ash/40"
      />
    </label>
  );
}
