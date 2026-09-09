import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center py-4">
      <Link href="/" className="text-lg font-semibold">
        캔슬캣
      </Link>
    </header>
  );
}
