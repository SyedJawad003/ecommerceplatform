import Link from "next/link";
import { signUp } from "@/lib/auth-actions";
import { SubmitButton } from "@/components/submit-button";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-page"><Link className="brand" href="/">atelier<span>.</span></Link><section className="auth-card"><p className="eyebrow">YOUR BUSINESS, BEAUTIFULLY ORGANIZED</p><h1>Create your store</h1><p className="muted">Start with a free merchant account.</p>{error && <p role="alert" className="form-error">{error}</p>}<form action={signUp} className="form-grid"><label>First name<input name="firstName" autoComplete="given-name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" required /></label><label className="wide">Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label><label>Confirm password<input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required /></label><label className="wide">Store name<input name="storeName" placeholder="The Living Glass" required /></label><SubmitButton pendingLabel="Creating your store…">Create account <span>→</span></SubmitButton></form><p className="auth-foot">Already have an account? <Link href="/login">Sign in</Link></p></section></main>;
}
