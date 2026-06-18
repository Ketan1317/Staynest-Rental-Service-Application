import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Spinner, ErrorState } from "@/components/States";
import { EnquiryAPI, unwrapList, type EnquiryMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/enquiries/$enquiryId")({
  component: EnquiryThread,
});

function EnquiryThread() {
  const { enquiryId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    try {
      const res = await EnquiryAPI.messages(enquiryId);
      setMessages(unwrapList<EnquiryMessage>(res));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 8000); // light polling
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiryId]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      await EnquiryAPI.send(enquiryId, draft.trim());
      setDraft("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Send failed");
    } finally { setSending(false); }
  }

  async function close() {
    setClosing(true);
    try { await EnquiryAPI.close(enquiryId); navigate({ to: "/enquiries" }); }
    catch (e: any) { setError(e?.message ?? "Failed"); }
    finally { setClosing(false); }
  }

  async function remove() {
    if (!confirm("Delete this enquiry?")) return;
    try { await EnquiryAPI.remove(enquiryId); navigate({ to: "/enquiries" }); }
    catch (e: any) { setError(e?.message ?? "Failed"); }
  }

  return (
    <SiteLayout>
      <section className="max-w-3xl mx-auto px-6 md:px-10 pt-10 pb-24">
        <Link to="/enquiries" className="text-xs uppercase tracking-widest text-ash hover:text-brass transition-colors">
          ← All enquiries
        </Link>
        <div className="flex items-center justify-between mt-6 mb-8">
          <h1 className="font-serif text-3xl md:text-4xl">Conversation</h1>
          <div className="flex gap-3">
            {user?.role === "OWNER" && (
              <button onClick={close} disabled={closing}
                className="text-[10px] uppercase tracking-[0.15em] border border-white/10 hover:border-brass hover:text-brass px-4 py-2 transition-colors disabled:opacity-50">
                Close
              </button>
            )}
            {user?.role !== "OWNER" && (
              <button onClick={remove}
                className="text-[10px] uppercase tracking-[0.15em] border border-white/10 hover:border-destructive hover:text-destructive px-4 py-2 transition-colors">
                Delete
              </button>
            )}
          </div>
        </div>

        {error && <ErrorState message={error} />}

        <div ref={scrollerRef} className="border border-border bg-surface/40 h-[55vh] overflow-y-auto p-6 space-y-4">
          {loading ? <Spinner label="Loading" /> : messages.length === 0 ? (
            <p className="text-ash text-center text-sm py-12 font-light">No messages yet. Start the conversation.</p>
          ) : messages.map((m) => {
            
            const mine = m.senderId._id === user?.id;
            return (
              <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-3 ${mine ? "bg-brass text-obsidian" : "bg-charcoal text-paper border border-white/5"}`}>
                  <p className="text-sm whitespace-pre-line">{m.message}</p>
                  <p className={`text-[10px] mt-1 uppercase tracking-widest ${mine ? "text-obsidian/60" : "text-ash"}`}>
                    {m.senderId?.name} · {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={send} className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 bg-surface/60 border border-white/10 px-4 py-3 text-paper focus:border-brass focus:outline-none"
          />
          <button disabled={sending || !draft.trim()}
            className="bg-brass hover:bg-brass-hover disabled:opacity-50 text-obsidian px-8 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors">
            Send
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}
