import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import CountryMarquee from "../components/CountryMarquee";
import Calculator from "../components/Calculator";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import AppCTA from "../components/AppCTA";
import FAQ from "../components/FAQ";

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      // Espera un frame para que el layout ya esté pintado antes de saltar.
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
    }
  }, [hash]);

  return (
    <main>
      <Hero />
      <CountryMarquee />
      <Calculator />
      <HowItWorks />
      <Features />
      <Testimonials />
      <AppCTA />
      <FAQ />
    </main>
  );
}
