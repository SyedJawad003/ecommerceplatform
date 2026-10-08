import Link from "next/link";
import { logIn } from "@/lib/auth-actions";
import { SubmitButton } from "@/components/submit-button";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-page"><Link className="brand" href="/">atelier<span>.</span></Link><section className="auth-card"><p className="eyebrow">WELCOME BACK</p><h1>Sign in</h1><p className="muted">Pick up where your business left off.</p>{error && <p role="alert" className="form-error">{error}</p>}<form action={logIn} className="form-grid single"><label className="wide">Email<input name="email" type="email" autoComplete="email" required /></label><label className="wide">Password<input name="password" type="password" autoComplete="current-password" required /></label><SubmitButton pendingLabel="Signing in…">Sign in <span>→</span></SubmitButton></form><p className="auth-foot">New to atelier? <Link href="/signup">Create your store</Link></p></section></main>;
}
