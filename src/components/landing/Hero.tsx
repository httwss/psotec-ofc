import { Button } from "@/components/ui/button";
import { ShoppingBag, MessageCircle, Shield, Star } from "lucide-react";
import heroImage from "@/assets/psotec-hero.png";
import { whatsappLink, SITE_CONFIG } from "@/config/site";

export const Hero = () => (
  <section className="relative overflow-hidden gradient-hero">
    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
    <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

    <div className="container relative grid gap-12 px-4 py-16 md:py-24 lg:grid-cols-2 lg:items-center lg:gap-8">
      <div className="animate-fade-in">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
          <Shield className="h-4 w-4" />
          Fórmula dermatologicamente testada
        </div>

        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Chega de sofrer com{" "}
          <span className="text-gradient-health">psoríase</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
          O <strong className="text-foreground">Psotec</strong> alivia a coceira, reduz a vermelhidão e elimina a descamação, devolvendo o conforto e a confiança da sua pele.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="hero" size="xl" className="rounded-2xl">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <ShoppingBag /> Comprar Agora
            </a>
          </Button>
          <Button asChild variant="whatsapp" size="xl" className="rounded-2xl animate-pulse-glow">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> Falar no WhatsApp
            </a>
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-6">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">+12 mil</strong> clientes satisfeitos
          </p>
        </div>
      </div>

      <div className="relative flex justify-center animate-scale-in">
        <div className="absolute inset-0 gradient-health rounded-[3rem] blur-3xl opacity-20" />
        <div className="relative animate-float">
          <img
            src={heroImage}
            alt="Pomada Psotec para tratamento de psoríase"
            width={1280}
            height={1280}
            className="relative z-10 w-full max-w-md rounded-[2.5rem] shadow-glow"
          />
        </div>
      </div>
    </div>
  </section>
);
