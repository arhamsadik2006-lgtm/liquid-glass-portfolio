import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <div className="grid-canvas grid-fade pointer-events-none absolute inset-0" />
      <div className="glass relative max-w-md rounded-[28px] p-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">Error 404 · Missing frame</p>
        <h1 className="font-display mt-3 text-4xl font-semibold">This shot didn&apos;t make the cut.</h1>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">Home</Link>
          <Link href="/projects" className="glass rounded-full px-5 py-2.5 text-sm">Projects</Link>
        </div>
      </div>
    </main>
  );
}
