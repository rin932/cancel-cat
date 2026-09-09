import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-1 py-6">
      <Link href="/" className="group flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber/15 text-lg">
          냥
        </span>
        <span>
          <span className="display block text-xl font-semibold tracking-tight">
            캔슬캣
          </span>
          <span className="text-[11px] uppercase tracking-[0.22em] text-amber/80">
            Cancel Cat
          </span>
        </span>
      </Link>
    </header>
  );
}
