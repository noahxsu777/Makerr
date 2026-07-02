import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CountryMarquee from "./components/CountryMarquee";
import Calculator from "./components/Calculator";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import AppCTA from "./components/AppCTA";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
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
      <Footer />
    </>
  );
}

export default App;
