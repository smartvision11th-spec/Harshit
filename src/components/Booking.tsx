import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { gsap } from '../animations/gsap';
import { staggerIn } from '../animations/scrollAnimations';
import { useBooking } from '../context/BookingContext';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { SERVICES, SITE, WHATSAPP_IS_PLACEHOLDER } from '../config/site';

type FormState = { name: string; phone: string; vehicle: string; service: string; date: string };
type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = { name: '', phone: '', vehicle: '', service: '', date: '' };
const ADVICE_VALUE = 'advice';

const pad = (n: number) => String(n).padStart(2, '0');
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function validate(v: FormState): Errors {
  const errors: Errors = {};
  const name = v.name.trim();
  if (name.length < 2) errors.name = 'Enter your full name (at least 2 characters).';
  else if (name.length > 60) errors.name = 'Name is too long (60 characters max).';

  const digits = v.phone.replace(/\D/g, '');
  if (!/^[+\d\s()-]+$/.test(v.phone.trim()) || digits.length < 8 || digits.length > 15) {
    errors.phone = 'Enter a valid phone number with 8 to 15 digits.';
  }

  if (v.vehicle.trim().length < 2) errors.vehicle = 'Enter your vehicle make and model.';
  if (!v.service) errors.service = 'Choose the service you need.';

  if (!v.date) errors.date = 'Choose a preferred date.';
  else if (v.date < todayISO()) errors.date = 'Choose today or a future date.';
  return errors;
}

function serviceLabel(id: string): string {
  if (id === ADVICE_VALUE) return 'Not sure yet, need advice';
  return SERVICES.find((s) => s.id === id)?.name ?? id;
}

function buildWhatsAppUrl(v: FormState): string {
  const date = new Date(`${v.date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const message = [
    `Hello ${SITE.name}, I'd like to book an appointment.`,
    '',
    `Name: ${v.name.trim()}`,
    `Phone: ${v.phone.trim()}`,
    `Vehicle: ${v.vehicle.trim()}`,
    `Service: ${serviceLabel(v.service)}`,
    `Preferred date: ${date}`,
  ].join('\n');
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

type FieldProps = {
  id: keyof FormState;
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-silver">
        {label}
      </label>
      {children}
      <p id={`${id}-error`} role={error ? 'alert' : undefined} className="mt-1.5 min-h-[1.25rem] text-sm text-[#ff8a8a]">
        {error}
      </p>
    </div>
  );
}

export default function Booking() {
  const root = useRef<HTMLElement>(null);
  const formEl = useRef<HTMLFormElement>(null);
  const reduced = useReducedMotion();
  const { service: preselected } = useBooking();

  const [values, setValues] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [waUrl, setWaUrl] = useState('');
  const min = useMemo(todayISO, []);

  const errors = useMemo(() => validate(values), [values]);
  const visible = (key: keyof FormState) => (touched[key] || submitted ? errors[key] : undefined);

  useEffect(() => {
    if (import.meta.env.DEV && WHATSAPP_IS_PLACEHOLDER) {
      console.warn('[Velocity] SITE.whatsappNumber in src/config/site.ts is still a placeholder. Set your real number before launch.');
    }
  }, []);

  // A service chosen from the Services dialog preselects it here.
  useEffect(() => {
    if (preselected) setValues((v) => ({ ...v, service: preselected }));
  }, [preselected]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      staggerIn(gsap.utils.toArray<HTMLElement>('[data-book-col]'), el, { stagger: 0.18 });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };
  const blur = (key: keyof FormState) => () => setTouched((t) => ({ ...t, [key]: true }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const current = validate(values);
    if (Object.keys(current).length > 0) {
      formEl.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    const url = buildWhatsAppUrl(values);
    setWaUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const reset = () => {
    setValues(EMPTY);
    setTouched({});
    setSubmitted(false);
    setWaUrl('');
  };

  const ariaFor = (key: keyof FormState) => ({
    'aria-invalid': visible(key) ? (true as const) : undefined,
    'aria-describedby': `${key}-error`,
  });

  const sent = Boolean(waUrl);

  return (
    <section id="booking" ref={root} className="relative bg-graphite py-[clamp(5rem,11vw,10rem)]" aria-labelledby="booking-title">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div data-book-col className="lg:col-span-5">
          <h2 id="booking-title" className="display text-[clamp(3rem,6.6vw,6.6rem)]">
            Book your appointment
          </h2>
          <p className="mt-6 max-w-[40ch] text-silver">
            Send your details and we will pick up the conversation on WhatsApp to confirm the service, the quote and a time that suits you.
          </p>

          <ul className="mt-10 space-y-5">
            <li className="flex items-start gap-4">
              <Phone size={20} className="mt-1 shrink-0 text-ember" aria-hidden="true" />
              <a href={`tel:${SITE.phoneHref}`} className="min-h-[44px] py-2 text-lg hover:text-ember">
                {SITE.phoneDisplay}
              </a>
            </li>
            <li className="flex items-start gap-4">
              <MessageCircle size={20} className="mt-1 shrink-0 text-ember" aria-hidden="true" />
              <a href={`https://wa.me/${SITE.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="min-h-[44px] py-2 text-lg hover:text-ember">
                Message us on WhatsApp
              </a>
            </li>
            <li className="flex items-start gap-4">
              <Mail size={20} className="mt-1 shrink-0 text-ember" aria-hidden="true" />
              <a href={`mailto:${SITE.email}`} className="min-h-[44px] py-2 text-lg hover:text-ember">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-4">
              <MapPin size={20} className="mt-1 shrink-0 text-ember" aria-hidden="true" />
              <span className="py-2 text-lg">
                {SITE.addressLine}, {SITE.city}
              </span>
            </li>
            <li className="flex items-start gap-4">
              <Clock size={20} className="mt-1 shrink-0 text-ember" aria-hidden="true" />
              <span className="py-2 text-lg">{SITE.hours}</span>
            </li>
          </ul>
        </div>

        <div data-book-col className="lg:col-span-7">
          <div className="glass rounded-3xl p-6 sm:p-10">
            {sent ? (
              <div role="status" className="flex min-h-[28rem] flex-col items-start justify-center gap-5">
                <CheckCircle2 size={44} className="text-ember" aria-hidden="true" />
                <h3 className="display text-5xl">Almost there</h3>
                <p className="max-w-[44ch] text-silver">
                  WhatsApp should have opened with your booking details filled in. Press send in WhatsApp to complete your enquiry.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    <MessageCircle size={18} aria-hidden="true" />
                    Open WhatsApp again
                  </a>
                  <button type="button" onClick={reset} className="btn btn-ghost">
                    Make another enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form ref={formEl} onSubmit={onSubmit} noValidate aria-label="Booking enquiry form">
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Field id="name" label="Your name" error={visible('name')}>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Full name"
                      className="field"
                      value={values.name}
                      onChange={set('name')}
                      onBlur={blur('name')}
                      {...ariaFor('name')}
                    />
                  </Field>

                  <Field id="phone" label="Phone number" error={visible('phone')}>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      className="field"
                      value={values.phone}
                      onChange={set('phone')}
                      onBlur={blur('phone')}
                      {...ariaFor('phone')}
                    />
                  </Field>

                  <Field id="vehicle" label="Vehicle model" error={visible('vehicle')}>
                    <input
                      id="vehicle"
                      name="vehicle"
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. Porsche 911 Carrera"
                      className="field"
                      value={values.vehicle}
                      onChange={set('vehicle')}
                      onBlur={blur('vehicle')}
                      {...ariaFor('vehicle')}
                    />
                  </Field>

                  <Field id="date" label="Preferred date" error={visible('date')}>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      min={min}
                      className="field"
                      value={values.date}
                      onChange={set('date')}
                      onBlur={blur('date')}
                      {...ariaFor('date')}
                    />
                  </Field>
                </div>

                <Field id="service" label="Required service" error={visible('service')}>
                  <select
                    id="service"
                    name="service"
                    className="field"
                    value={values.service}
                    onChange={set('service')}
                    onBlur={blur('service')}
                    {...ariaFor('service')}
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                    <option value={ADVICE_VALUE}>Not sure yet, need advice</option>
                  </select>
                </Field>

                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" className="btn btn-primary h-14 px-8 text-base">
                    <CalendarDays size={20} aria-hidden="true" />
                    Book on WhatsApp
                  </button>
                  <p className="text-sm text-smoke">Opens WhatsApp with your details filled in. Nothing is sent until you press send.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
