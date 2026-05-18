import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Benefits } from "@/components/landing/Benefits";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { Testimonials } from "@/components/landing/Testimonials";
import { About } from "@/components/landing/About";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";

import { PromoBanner } from "@/components/landing/PromoBanner";

const Index = () => (
  <main className="min-h-screen bg-background">
    <PromoBanner />
    <Navbar />
    <Hero />
    <Benefits />
    <BeforeAfter />
    <Testimonials />
    <About />
    <FinalCTA />
    <Footer />
    <FloatingWhatsApp />
    
  </main>
);

export default Index;
