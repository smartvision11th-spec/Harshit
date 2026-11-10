/**
 * Central, editable business configuration.
 * Everything marked PLACEHOLDER must be replaced before going live.
 */

export const SITE = {
  name: 'Velocity Auto Detailing',
  shortName: 'Velocity',
  tagline: 'Beyond clean. Perfection in motion.',
  description:
    'Velocity Auto Detailing is a premium detailing studio offering ceramic coating, paint protection film, paint correction, interior deep cleaning and graphene coating.',

  // PLACEHOLDER: set to your production URL (no trailing slash) so canonical and Open Graph URLs resolve.
  url: '',

  // PLACEHOLDER: international format, digits only, no "+" (e.g. 919876543210). All zeros = not configured.
  whatsappNumber: '910000000000',
  // PLACEHOLDER: shown to visitors and used for click-to-call.
  phoneDisplay: '+91 00000 00000',
  phoneHref: '+910000000000',
  email: 'hello@example.com', // PLACEHOLDER
  addressLine: 'Studio address to be added', // PLACEHOLDER
  city: 'Your City', // PLACEHOLDER
  hours: 'Mon–Sat 9:00–19:00', // PLACEHOLDER

  instagramUrl: 'https://www.instagram.com/', // PLACEHOLDER: link to your profile
  mapsUrl: 'https://maps.google.com/', // PLACEHOLDER: link to your Google Maps listing

  /** Optional: path to a GLB car model inside /public (e.g. '/models/car.glb'). Empty = built-in procedural car. */
  carModelUrl: '' as string,
} as const;

export const WHATSAPP_IS_PLACEHOLDER = /^0+$/.test(SITE.whatsappNumber.replace(/^91/, ''));

export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#booking' },
];

export type Service = {
  id: string;
  name: string;
  short: string;
  detail: string;
  points: string[];
  image: string;
};

export const SERVICES: Service[] = [
  {
    id: 'ceramic-coating',
    name: 'Ceramic Coating',
    short: 'A hard, glass-like layer that repels water, dirt and UV.',
    detail:
      'A professional-grade ceramic coating bonds to the clear coat and makes the surface easier to clean, deeper in gloss and more resistant to everyday contamination.',
    points: ['Full paint prep and decontamination', 'Layered coating application', 'Curing guidance and aftercare'],
    image: '/images/service-ceramic.webp',
  },
  {
    id: 'ppf',
    name: 'Paint Protection Film (PPF)',
    short: 'Self-healing urethane film against chips, scratches and stains.',
    detail:
      'Clear or satin film is fitted to high-impact areas or the whole car to take the damage that would otherwise reach your paint.',
    points: ['Front-end, high-impact or full-body coverage', 'Precision-fitted film edges', 'Clear and satin finishes'],
    image: '/images/service-ppf.webp',
  },
  {
    id: 'paint-correction',
    name: 'Paint Correction',
    short: 'Machine polishing that removes swirls, haze and light scratches.',
    detail:
      'Paint depth is measured first, then the surface is polished in stages to restore clarity and colour without removing more clear coat than necessary.',
    points: ['Paint thickness inspection', 'Single-stage or multi-stage polish', 'Finishing polish for maximum gloss'],
    image: '/images/service-correction.webp',
  },
  {
    id: 'interior-detailing',
    name: 'Interior Deep Cleaning',
    short: 'Seats, carpets, panels and glass, cleaned and conditioned.',
    detail:
      'Every surface inside the cabin is vacuumed, steam-cleaned where suitable, treated and conditioned so the interior feels fresh rather than perfumed.',
    points: ['Leather and fabric cleaning', 'Dashboard, vents and trim detailing', 'Interior glass and odour treatment'],
    image: '/images/service-interior.webp',
  },
  {
    id: 'exterior-detailing',
    name: 'Exterior Detailing',
    short: 'A meticulous wash, decontamination and sealed finish.',
    detail:
      'A careful contact wash, iron and tar removal, clay treatment and a protective sealant for a clean, glossy exterior that lasts.',
    points: ['Foam pre-wash and contact wash', 'Iron, tar and fallout removal', 'Wheels, arches, trim and glass'],
    image: '/images/service-exterior.webp',
  },
  {
    id: 'graphene-coating',
    name: 'Graphene Coating',
    short: 'A heat-resistant coating focused on water behaviour and gloss.',
    detail:
      'A graphene-based coating adds slickness, water beading and a deep finish, and is applied over fully prepared paint.',
    points: ['Paint prep and polishing', 'Coating applied panel by panel', 'Maintenance wash advice'],
    image: '/images/service-graphene.webp',
  },
];

export const PROCESS_STEPS = [
  {
    title: 'Inspection',
    text: 'We examine the paint under dedicated lighting, record existing damage and measure paint depth before anything is touched.',
    image: '/images/process-inspect.webp',
  },
  {
    title: 'Deep cleaning',
    text: 'Foam, contact wash and chemical decontamination lift road film, iron fallout and tar without scratching the surface.',
    image: '/images/process-clean.webp',
  },
  {
    title: 'Paint correction',
    text: 'Machine polishing removes swirls and haze in stages, restoring clarity and depth to the clear coat.',
    image: '/images/process-correct.webp',
  },
  {
    title: 'Surface protection',
    text: 'Ceramic, graphene or film is applied to the prepared paint to defend the finish day to day.',
    image: '/images/process-protect.webp',
  },
  {
    title: 'Final detailing',
    text: 'Final inspection, panel wipe-down, glass, tyres and trim. The car is checked in daylight before handover.',
    image: '/images/process-final.webp',
  },
] as const;

export const WHY_US = [
  { title: 'Professional equipment', text: 'Dual-action polishers, paint depth gauges and inspection lighting.' },
  { title: 'Skilled technicians', text: 'Detailers who work one car at a time and follow a repeatable process.' },
  { title: 'Premium products', text: 'Professional-grade coatings, films and chemistry chosen for each job.' },
  { title: 'Attention to detail', text: 'Edges, shut lines, badges and trim get the same care as the bonnet.' },
  { title: 'Customer satisfaction', text: 'Clear quotes, honest advice and a final walk-around before handover.' },
] as const;

export const GALLERY = [
  { src: '/images/gallery-1.webp', alt: 'Glossy red paint reflecting studio lights', w: 'w-[78vw] md:w-[34vw]', h: 'h-[56vh] md:h-[62vh]', offset: 'md:mt-0' },
  { src: '/images/gallery-2.webp', alt: 'Silver metallic panel with crisp reflections', w: 'w-[64vw] md:w-[24vw]', h: 'h-[44vh] md:h-[46vh]', offset: 'md:mt-24' },
  { src: '/images/gallery-3.webp', alt: 'Deep black paint with a mirror finish', w: 'w-[78vw] md:w-[30vw]', h: 'h-[58vh] md:h-[66vh]', offset: 'md:mt-6' },
  { src: '/images/gallery-4.webp', alt: 'Blue metallic bodywork under soft light', w: 'w-[60vw] md:w-[22vw]', h: 'h-[42vh] md:h-[40vh]', offset: 'md:mt-32' },
  { src: '/images/gallery-5.webp', alt: 'Graphite grey paint with a ceramic gloss', w: 'w-[78vw] md:w-[36vw]', h: 'h-[54vh] md:h-[58vh]', offset: 'md:mt-10' },
  { src: '/images/gallery-6.webp', alt: 'Orange pearl paint catching light along a body line', w: 'w-[66vw] md:w-[26vw]', h: 'h-[46vh] md:h-[50vh]', offset: 'md:mt-20' },
] as const;

/** SAMPLE content only. Replace with real, permissioned customer reviews. */
export const TESTIMONIALS = [
  {
    quote: 'Sample review text. Replace this with a real customer testimonial about the finish and the service.',
    name: 'Customer name',
    car: 'Vehicle model',
  },
  {
    quote: 'Sample review text. Add a genuine quote about communication, quality of work or aftercare here.',
    name: 'Customer name',
    car: 'Vehicle model',
  },
  {
    quote: 'Sample review text. Use feedback you have permission to publish, with the customer’s name if they agree.',
    name: 'Customer name',
    car: 'Vehicle model',
  },
] as const;
