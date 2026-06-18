import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { AuthAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({ meta: [{ title: "Join — StayNest" }] }),
});

function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "OWNER">("USER");
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("phone", phone);
      fd.append("password", password);
      fd.append("role", role);
      if (image) fd.append("image", image);

      const res = await AuthAPI.register(fd);
      if (!res?.token) throw new Error("No token returned");
      signIn(res.token, res.user ?? { name, email, phone, role, profileImage: res.profileImage });
      navigate({ to: "/" });
    } catch (e: any) {
      setError(e?.message ?? "Registration failed");
    } finally { setBusy(false); }
  }

  return (
    <SiteLayout>
      <section className="max-w-md mx-auto px-6 md:px-10 py-20">
        <span className="text-brass text-[10px] uppercase tracking-[0.3em]">Create Account</span>
        <h1 className="font-serif text-5xl mt-3 mb-10">Join StayNest.</h1>

        <form onSubmit={submit} className="space-y-5">
          <Field label="Full name" value={name} onChange={setName} required />
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Phone" value={phone} onChange={setPhone} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />

          <div>
            <span className="text-[10px] uppercase tracking-widest text-ash mb-2 block">I am a</span>
            <div className="grid grid-cols-2 gap-2">
              {(["USER", "OWNER"] as const).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`py-3 text-[11px] uppercase tracking-[0.15em] border transition-colors ${
                    role === r ? "border-brass bg-brass text-obsidian font-semibold" : "border-white/10 text-paper/80 hover:border-white/30"
                  }`}>
                  {r === "USER" ? "Resident" : "Property owner"}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-ash">Profile image (optional)</span>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="mt-2 w-full text-sm text-paper/80 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-surface file:text-paper file:text-xs file:uppercase file:tracking-widest file:cursor-pointer hover:file:bg-surface/70" />
          </label>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button disabled={busy} className="w-full bg-brass hover:bg-brass-hover text-obsidian py-4 text-[11px] uppercase tracking-[0.15em] font-semibold transition-colors disabled:opacity-50">
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-ash text-sm mt-8 text-center font-light">
          Already a member?{" "}
          <Link to="/login" className="text-brass hover:text-brass-hover border-b border-brass/30">Sign in</Link>
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
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-surface/60 border border-white/10 px-4 py-3 text-paper focus:border-brass focus:outline-none transition-colors" />
    </label>
  );
}
