import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { gsap, ScrollTrigger } from '../animations/gsap';
import { dialogVariants, overlayVariants } from '../animations/motionConfig';
import { useSmoothScroll } from '../animations/SmoothScroll';
import { useBooking } from '../context/BookingContext';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { SERVICES, type Service } from '../config/site';

/* ------------------------------------------------------------------ card */

function ServiceCard({ service, onOpen }: { service: Service; onOpen: (s: Service) => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || reduced || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: px * 10, rotateX: -py * 10, transformPerspective: 900, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
    el.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
    el.style.setProperty('--my', `${(py + 0.5) * 100}%`);
  };

  const onLeave = () => {
    if (ref.current) gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
  };

  return (
    <article
      ref={ref}
      data-service-card
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-graphite shadow-[0_40px_60px_-40px_rgba(0,0,0,0.9)] will-change-transform"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={service.image}
          alt={`${service.name} service preview`}
          width={800}
          height={1000}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.12), transparent 45%)' }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        <h3 className="display text-[clamp(2rem,3.2vw,2.5rem)]">{service.name}</h3>
        <p className="mt-2 max-w-[34ch] text-[0.97rem] text-silver">{service.short}</p>
        <button
          type="button"
          onClick={() => onOpen(service)}
          aria-label={`Learn more about ${service.name}`}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-ember"
        >
          Learn more
          <ArrowUpRight size={17} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------- modal */

type ModalProps = { service: Service; onClose: () => void; onEnquire: (id: string) => void };

function ServiceModal({ service, onClose, onEnquire }: ModalProps) {
  const { stop, start } = useSmoothScroll();
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    stop();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialog.current) return;
      const focusable = dialog.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      start();
      previouslyFocused?.focus?.();
    };
  }, [stop, start]);

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      data-lenis-prevent
    >
      <motion.div
        ref={dialog}
        variants={dialogVariants}
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-dialog-title"
        className="relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-white/10 bg-graphite sm:rounded-3xl md:grid-cols-2"
      >
        <div className="relative h-52 md:h-auto">
          <img src={service.image} alt="" width={800} height={1000} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent md:bg-gradient-to-r" />
        </div>

        <div className="flex flex-col p-6 md:p-10">
          <h3 id="service-dialog-title" className="display text-[clamp(2.4rem,5vw,3.6rem)]">
            {service.name}
          </h3>
          <p className="mt-4 text-silver">{service.detail}</p>
          <ul className="mt-6 space-y-3">
            {service.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-bone">
                <Check size={18} className="mt-1 shrink-0 text-ember" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn btn-primary" onClick={() => onEnquire(service.id)}>
              Enquire about this service
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-ink/70 text-bone backdrop-blur"
        >
          <X size={20} />
        </button>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------------------- section */

export default function Services() {
  const root = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState<Service | null>(null);
  const { setService } = useBooking();
  const { scrollTo } = useSmoothScroll();

  // Staggered scroll-triggered reveal, batched per visible row.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-service-card]');
      gsap.set(cards, { autoAlpha: 0, y: 70 });
      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, overwrite: true }),
      });
      gsap.fromTo(
        '[data-services-head]',
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 75%', once: true } },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const close = useCallback(() => setActive(null), []);
  const enquire = useCallback(
    (id: string) => {
      setService(id);
      setActive(null);
      window.setTimeout(() => scrollTo('#booking'), 380);
    },
    [setService, scrollTo],
  );

  return (
    <section id="services" ref={root} className="relative bg-graphite py-[clamp(5rem,11vw,10rem)]">
      <div className="container-x">
        <div data-services-head className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display max-w-[14ch] text-[clamp(3rem,7.4vw,7.2rem)]">Detailing, protection &amp; correction</h2>
          <p className="max-w-[40ch] text-silver">
            From a careful exterior detail to a full ceramic or film package, every service starts with an inspection and
            ends with a handover you can see for yourself.
          </p>
        </div>

        <div ref={grid} className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:[&>*:nth-child(3n+2)]:mt-14">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} onOpen={setActive} />
          ))}
        </div>
      </div>

      <AnimatePresence>{active && <ServiceModal key={active.id} service={active} onClose={close} onEnquire={enquire} />}</AnimatePresence>
    </section>
  );
}
