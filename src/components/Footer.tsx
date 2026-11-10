import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import { useSmoothScroll } from '../animations/SmoothScroll';
import { NAV_LINKS, SERVICES, SITE } from '../config/site';

export default function Footer() {
  const { scrollTo } = useSmoothScroll();
  const year = new Date().getFullYear();

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo(href);
  };

  return (
    <footer className="border-t border-white/10 bg-ink pb-10 pt-20">
      <div className="container-x">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo />
            <p className="mt-6 max-w-[34ch] text-smoke">{SITE.tagline} Premium detailing, protection and correction for cars that deserve it.</p>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-silver transition-colors hover:text-ember"
            >
              <Instagram size={20} aria-hidden="true" />
              Follow on Instagram
            </a>
          </div>

          <nav aria-label="Footer" className="md:col-span-2">
            <h2 className="display text-2xl">Explore</h2>
            <ul className="mt-4 space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={go(l.href)} className="inline-flex min-h-[40px] items-center text-smoke transition-colors hover:text-bone">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="display text-2xl">Services</h2>
            <ul className="mt-4 space-y-1">
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <a href="#services" onClick={go('#services')} className="inline-flex min-h-[40px] items-center text-smoke transition-colors hover:text-bone">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="display text-2xl">Contact</h2>
            <ul className="mt-4 space-y-3 text-smoke">
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-1 shrink-0 text-ember" aria-hidden="true" />
                <a href={`tel:${SITE.phoneHref}`} className="hover:text-bone">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-1 shrink-0 text-ember" aria-hidden="true" />
                <a href={`mailto:${SITE.email}`} className="hover:text-bone">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-ember" aria-hidden="true" />
                <span>
                  {SITE.addressLine}, {SITE.city}
                  <br />
                  <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-silver underline decoration-white/20 underline-offset-4 hover:text-ember">
                    View on Google Maps
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-smoke md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {year} {SITE.name}. All rights reserved.
          </p>
          <button type="button" onClick={() => scrollTo('#top')} className="inline-flex min-h-[44px] items-center text-silver hover:text-ember">
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
