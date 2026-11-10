import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import Magnetic from './Magnetic';
import { NAV_LINKS } from '../config/site';
import { useSmoothScroll } from '../animations/SmoothScroll';
import { menuItemVariants, menuVariants } from '../animations/motionConfig';

export default function Navbar() {
  const { scrollTo, stop, start } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open; close on Escape.
  useEffect(() => {
    if (!open) return;
    stop();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      start();
    };
  }, [open, stop, start]);

  // Close the menu if the viewport grows to desktop.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mql.matches && setOpen(false);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const go = useCallback(
    (href: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      setOpen(false);
      window.setTimeout(() => scrollTo(href), open ? 350 : 0);
    },
    [scrollTo, open],
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,padding] duration-500 ${
          scrolled || open
            ? 'border-b border-white/[0.07] bg-ink/75 py-3 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent py-5'
        }`}
      >
        <div className="container-x flex items-center justify-between">
          <a href="#top" onClick={go('#top')} aria-label="Velocity Auto Detailing, back to top" className="relative z-50">
            <Logo />
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-10 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={go(link.href)}
                className="group relative py-2 text-[0.95rem] text-silver transition-colors hover:text-bone"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ember transition-transform duration-500 ease-out group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <Magnetic strength={0.25}>
                <a href="#booking" onClick={go('#booking')} className="btn btn-primary">
                  Book Appointment
                </a>
              </Magnetic>
            </div>
            <button
              type="button"
              className="relative z-50 grid h-12 w-12 place-items-center rounded-full border border-white/15 text-bone lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-[clamp(1.25rem,4vw,3.5rem)] pb-10 pt-28 lg:hidden"
            data-lenis-prevent
          >
            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-2">
                {NAV_LINKS.map((link, i) => (
                  <motion.li key={link.href} custom={i} variants={menuItemVariants}>
                    <a
                      href={link.href}
                      onClick={go(link.href)}
                      className="display block py-2 text-[clamp(3rem,14vw,5rem)] text-bone transition-colors active:text-ember"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div custom={NAV_LINKS.length} variants={menuItemVariants}>
              <a href="#booking" onClick={go('#booking')} className="btn btn-primary w-full">
                Book Appointment
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
