import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { AuthAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Sign in — StayNest" }] }),
});

function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await AuthAPI.login(email, password);
      if (!res?.token) throw new Error("No token returned");
      signIn(res.token, res.user ?? null);
      navigate({ to: "/" });
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally { setBusy(false); }
  }

  return (
    <SiteLayout>
      <section className="max-w-md mx-auto px-6 md:px-10 py-20">
        <span className="text-brass text-[10px] uppercase tracking-[0.3em]">Member Portal</span>
        <h1 className="font-serif text-5xl mt-3 mb-10">Welcome back.</h1>

        <form onSubmit={submit} className="space-y-5">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button disabled={busy} className="w-full bg-brass hover:bg-brass-hover text-obsidian py-4 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-ash text-sm mt-8 text-center font-light">
          New to StayNest?{" "}
          <Link to="/register" className="text-brass hover:text-brass-hover border-b border-brass/30">Create an account</Link>
        </p>
      </section>
    </SiteLayout>
  );
}

function Field({ label, type = "text", value, onChange, required }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-ash">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-surface/60 border border-white/10 px-4 py-3 text-paper focus:border-brass focus:outline-none transition-colors"
      />
    </label>
  );
}
