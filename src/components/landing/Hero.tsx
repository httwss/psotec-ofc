import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, ShoppingBag, ShieldCheck, Leaf, Users } from "lucide-react";
import heroImage from "@/assets/psotec-hero.png";
import { whatsappLink } from "@/config/site";

const trustItems = [
  { icon: ShieldCheck, label: "Formula dermatologica" },
  { icon: Leaf, label: "Ativos naturais" },
  { icon: Users, label: "+12 mil pessoas" },
];

export const Hero = () => (
  <section className="relative overflow-hidden bg-white">
    <div className="absolute inset-0 gradient-hero pointer-events-none" />

    <div className="container relative px-6 py-20 md:py-28 lg:py-36">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">

        <div className="max-w-lg">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-primary/70">
            Cuidado dermatologico especializado
          </p>

          <h1 className="font-display text-[2.6rem] leading-[1.15] text-foreground sm:text-5xl md:text-[3.25rem]">
            Cuide da sua pele com mais{" "}
            <em className="not-italic text-primary">conforto</em> e confianca.
          </h1>

          <p className="mt-6 text-lg leading-[1.75] text-muted-foreground">
            Uma rotina de cuidado para aliviar o desconforto da pele. O Psotec combina ativos hidratantes e calmantes para devolver suavidade e equilibrio.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className="inline-flex h-14 items-center gap-2.5 rounded-full bg-primary px-8 text-base font-medium text-white shadow-glow transition-smooth hover:bg-primary/90">
              <Link to="/checkout">
                <ShoppingBag className="h-5 w-5" />
                Comprar Agora
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="inline-flex h-14 items-center gap-2.5 rounded-full border-whatsapp/30 bg-whatsapp/5 px-8 text-base font-medium text-whatsapp transition-smooth hover:bg-whatsapp hover:text-white"
            >
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Falar no WhatsApp
              </a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-6">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-primary/60" />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:justify-end">
          <div className="absolute h-[480px] w-[480px] rounded-full bg-gradient-to-br from-primary/8 to-secondary/8 blur-3xl" />
          <img
            src={heroImage}
            alt="Pomada Psotec para tratamento de psoríase"
            width={520}
            height={520}
            className="relative z-10 w-full max-w-[400px] drop-shadow-[0_40px_56px_rgba(0,90,130,0.18)]"
          />
        </div>
      </div>
    </div>
  </section>
);
