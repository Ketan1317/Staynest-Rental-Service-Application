import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { NotificationAPI } from "@/lib/api";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { isAuthed, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let ignore = false;
    if (!isAuthed) { setUnread(0); return; }
    NotificationAPI.unread()
      .then((r: any) => { if (!ignore) setUnread(r?.unreadCount ?? r?.data?.unreadCount ?? 0); })
      .catch(() => {});
    return () => { ignore = true; };
  }, [isAuthed]);

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl tracking-wide text-paper hover:text-brass transition-colors">
            STAYNEST
          </Link>
          <nav className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.2em] font-medium text-paper/80">
            <Link to="/browse" className="hover:text-brass transition-colors" activeProps={{ className: "text-brass" }}>
              Residences
            </Link>
            {isAuthed && (
              <>
                <Link to="/favorites" className="hover:text-brass transition-colors" activeProps={{ className: "text-brass" }}>
                  Favorites
                </Link>
                <Link to="/enquiries" className="hover:text-brass transition-colors" activeProps={{ className: "text-brass" }}>
                  Enquiries
                </Link>
                {user?.role === "OWNER" && (
                  <Link to="/owner" className="hover:text-brass transition-colors" activeProps={{ className: "text-brass" }}>
                    Owner
                  </Link>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-5">
            {isAuthed && (
              <Link to="/notifications" className="relative text-paper/80 hover:text-brass transition-colors" aria-label="Notifications">
                <BellIcon />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brass text-obsidian text-[10px] font-semibold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            )}
            {isAuthed ? (
              <button
                onClick={() => { signOut(); navigate({ to: "/" }); }}
                className="text-[11px] uppercase tracking-[0.15em] border-b border-brass/50 pb-1 hover:border-brass hover:text-brass transition-colors"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link to="/login" className="text-[11px] uppercase tracking-[0.15em] text-paper/80 hover:text-brass transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-[11px] uppercase tracking-[0.15em] bg-brass hover:bg-brass-hover text-obsidian px-5 py-2.5 font-semibold transition-colors"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border mt-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-serif text-2xl text-paper">STAYNEST</div>
            <p className="text-ash text-sm mt-2 font-light">Curated PGs, rooms and flats. Off-market quality.</p>
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-ash">
            © {new Date().getFullYear()} StayNest
          </div>
        </div>
      </footer>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
