import Link from "next/link";

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-20 py-8 max-md:px-12 max-sm:px-6 max-sm:py-6">
      <span className="flex items-center gap-3">
        <span
          className="p-sm flex h-6 w-6 items-center justify-center bg-hanko font-kanji leading-none text-cream"
          aria-hidden="true"
        >
          術
        </span>
        <span className="p-md tracking-tight text-cream">Naruto Techniques</span>
      </span>
      <Link
        href="/train"
        className="group p-md text-chakra outline-none transition hover:text-cream focus-visible:ring-2 focus-visible:ring-chakra focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Start training{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </header>
  );
}
