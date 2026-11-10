import { useCallback, useEffect, useState } from 'react';
import { SmoothScrollProvider } from './animations/SmoothScroll';
import { ScrollTrigger } from './animations/gsap';
import { BookingProvider } from './context/BookingContext';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import ScrollProgress from './components/ScrollProgress';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Services from './components/Services';
import CarShowcase from './components/CarShowcase';
import Process from './components/Process';
import BeforeAfter from './components/BeforeAfter';
import WhyUs from './components/WhyUs';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import Booking from './components/Booking';
import Footer from './components/Footer';
import SEO from './components/SEO';

export default function App() {
  const [ready, setReady] = useState(false);
  const onLoaded = useCallback(() => setReady(true), []);

  // Pinned sections measure the page: re-measure once fonts and every asset have settled.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => undefined);
    if (document.readyState === 'complete') refresh();
    else window.addEventListener('load', refresh, { once: true });
    return () => window.removeEventListener('load', refresh);
  }, []);

  useEffect(() => {
    if (ready) ScrollTrigger.refresh();
  }, [ready]);

  return (
    <SmoothScrollProvider locked={!ready}>
      <BookingProvider>
        <SEO />
        <Preloader onDone={onLoaded} />
        <Cursor />
        <ScrollProgress />
        <Navbar />
        <main>
          <Hero ready={ready} />
          <Intro />
          <Services />
          <CarShowcase />
          <Process />
          <BeforeAfter />
          <WhyUs />
          <Gallery />
          <Testimonials />
          <FinalCTA />
          <Booking />
        </main>
        <Footer />
      </BookingProvider>
    </SmoothScrollProvider>
  );
}
