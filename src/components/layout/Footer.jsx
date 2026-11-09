import Link from "next/link";
import KonohaScene from "@/components/animations/KonohaScene";
import BackToTop from "@/components/ui/BackToTop";
import KonohaMark from "@/components/ui/KonohaMark";
import SocialIcon from "@/components/ui/SocialIcon";
import { FOOTER_NAV, FOOTER_SOCIALS } from "@/data/footer-links";

/*
 * Closing scene: Konoha at sunset (animations/KonohaScene) with the footer
 * set into the shadowed hillside beneath it. All copy and links are real
 * HTML laid over the picture.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden bg-dusk text-cream">
      <KonohaScene />

      <div
        data-footer-content
        className="relative z-10 px-20 pb-[2.4vw] pt-[34vw] max-md:px-12 max-md:pb-10 max-md:pt-[56vw] max-sm:px-6 max-sm:pb-8 max-sm:pt-[88vw]"
      >
        {/* brand · nav · socials */}
        <div className="flex items-center gap-[3.6vw] max-md:flex-wrap max-md:gap-x-10 max-md:gap-y-10 max-sm:gap-y-8">
          <Link
            href="/"
            data-footer-reveal
            aria-label="Naruto Techniques home"
            className="relative flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-hanko"
          >
            <KonohaMark
              strokeWidth={4}
              className="absolute left-[44%] top-[42%] w-[6vw] -translate-x-1/2 -translate-y-1/2 text-hanko opacity-40 max-md:w-[11vw] max-sm:w-[17vw]"
            />
            <span className="h2 relative uppercase tracking-tight text-cream">Naruto</span>
            <span className="p-sm relative mt-[0.4vw] flex items-center gap-[0.8vw] uppercase tracking-[0.4em] text-muted max-md:mt-2 max-md:gap-3">
              <span aria-hidden="true" className="h-px w-[1.6vw] bg-hanko max-md:w-6" />
              Techniques
            </span>
          </Link>

          <span aria-hidden="true" className="h-[5vw] w-px bg-rule max-md:hidden" />

          <nav aria-label="Footer" data-footer-reveal className="max-md:order-3 max-md:w-full">
            <ul className="flex items-center gap-[4vw] max-md:gap-12 max-sm:gap-8">
              {FOOTER_NAV.map(({ label, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="chakra-link p-lg text-cream outline-none"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <span aria-hidden="true" className="ml-auto h-[5vw] w-px bg-rule max-md:hidden" />

          <ul
            data-footer-reveal
            className="flex items-center gap-[2.2vw] max-md:ml-auto max-md:gap-8 max-sm:order-4 max-sm:ml-0 max-sm:w-full max-sm:gap-7"
          >
            {FOOTER_SOCIALS.map(({ icon, label, href }) => (
              <li key={icon}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="chakra-icon block text-cream outline-none"
                >
                  <SocialIcon
                    icon={icon}
                    className="w-[1.6vw] max-md:w-[3.2vw] max-sm:w-[5.6vw]"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* tagline · back to top */}
        <div className="mt-[3vw] flex items-end justify-between gap-10 max-md:mt-14 max-sm:mt-12 max-sm:flex-col max-sm:items-start">
          <div data-footer-reveal className="relative">
            <p className="h3 max-w-[52ch] text-cream">
              Every shinobi has a story. <span className="text-ember">Yours doesn’t end here.</span>
            </p>
            <svg
              data-brush
              aria-hidden="true"
              viewBox="0 0 300 20"
              preserveAspectRatio="none"
              className="mt-[0.6vw] h-[0.9vw] w-[22vw] text-hanko max-md:mt-3 max-md:h-[1.6vw] max-md:w-[40vw] max-sm:h-[2.6vw] max-sm:w-[64vw]"
            >
              <path
                fill="currentColor"
                d="M3 14C60 7 150 3 297 4c-60 1-130 4-200 9-40 3-70 6-94 7-2-1-2-4 0-6Z"
              />
            </svg>
          </div>

          <div data-footer-reveal className="max-sm:self-end">
            <BackToTop />
          </div>
        </div>

        {/* signature line */}
        <div
          data-footer-reveal
          className="mt-[2.4vw] flex items-center gap-[1vw] max-md:mt-12 max-md:gap-4 max-sm:flex-wrap max-sm:gap-3"
        >
          <KonohaMark className="w-[1.4vw] shrink-0 text-muted max-md:w-[2.6vw] max-sm:w-[4.6vw]" />
          <p className="p-sm text-muted">© {year} Naruto Techniques. Believe it!</p>
          <span aria-hidden="true" className="h-px flex-1 bg-rule max-sm:hidden" />
          <p className="p-sm text-muted max-sm:w-full">
            Hand tracking runs on-device. Nothing is uploaded.
          </p>
        </div>
      </div>
    </footer>
  );
}
