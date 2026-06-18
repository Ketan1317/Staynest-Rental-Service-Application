import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { PropertyAPI, type Property } from "@/lib/api";
import { formatRent } from "@/lib/format";

type Props = {
  property: Property;
  initialFav?: boolean;
  onFavChange?: (id: string, isFav: boolean) => void;
};

export function PropertyCard({ property, initialFav = false, onFavChange }: Props) {
  const { isAuthed } = useAuth();
  const [fav, setFav] = useState(initialFav);
  const [busy, setBusy] = useState(false);

  const cover = property.images?.[0] || `https://picsum.photos/seed/${property._id}/600/750?grayscale`;

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthed || busy) return;
    setBusy(true);
    const next = !fav;
    setFav(next);
    try {
      if (next) await PropertyAPI.addFav(property._id);
      else await PropertyAPI.delFav(property._id);
      onFavChange?.(property._id, next);
    } catch {
      setFav(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Link
      to="/property/$propertyId"
      params={{ propertyId: property._id }}
      className="group flex flex-col"
    >
      <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-surface">
        <img
          src={cover}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-in-out"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5" />
        {isAuthed && (
          <button
            onClick={toggleFav}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            className="absolute top-4 right-4 size-10 rounded-full bg-obsidian/50 backdrop-blur-md flex items-center justify-center text-paper hover:text-brass transition-colors ring-1 ring-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-obsidian/80 to-transparent p-6 pt-12">
          <span className="bg-surface/90 backdrop-blur-sm text-brass border border-brass/20 text-[9px] uppercase tracking-[0.2em] px-3 py-1.5">
            {property.propertyType}
          </span>
        </div>
      </div>
      <div className="flex flex-col grow">
        <h3 className="font-serif text-2xl font-medium mb-1 group-hover:text-brass transition-colors">
          {property.title}
        </h3>
        <p className="text-ash text-sm mb-4 font-light line-clamp-1">
          {property.address}, {property.city}
        </p>
        <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-xl tabular-nums text-paper">{formatRent(property.rent)}</span>
            <span className="text-xs text-ash font-light">/ month</span>
          </div>
          {property.sharingType && (
            <span className="text-xs text-ash font-light uppercase tracking-wider">{property.sharingType}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
