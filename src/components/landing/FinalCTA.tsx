import { Link } from "react-router-dom";
import { MessageCircle, ShoppingBag, Truck, ShieldCheck, BadgeCheck } from "lucide-react";
import { whatsappLink } from "@/config/site";

const trust = [
  { icon: Truck, label: "Entrega para todo o Brasil" },
  { icon: ShieldCheck, label: "Garantia de satisfacao" },
  { icon: BadgeCheck, label: "Pagamento seguro" },
];

export const FinalCTA = () => (
  <section className="relative overflow-hidden bg-white py-24 md:py-32">
    <div className="absolute inset-0 gradient-hero pointer-events-none" />
    <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/5 blur-3xl" />

    <div className="container relative px-6 text-center">
      <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-primary/60">
        Comece agora
      </p>
      <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight text-foreground sm:text-4xl md:text-[2.75rem]">
        Sua pele merece uma rotina de cuidado que funciona
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-base leading-[1.8] text-muted-foreground">
        Comece o tratamento com Psotec e sinta a diferenca. Compre agora ou fale com nossa equipe pelo WhatsApp.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/checkout"
          className="inline-flex h-14 items-center gap-2.5 rounded-full bg-primary px-10 text-base font-medium text-white shadow-glow transition-smooth hover:bg-primary/90 hover:shadow-lg"
        >
          <ShoppingBag className="h-5 w-5" />
          Comprar Agora
        </Link>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-14 items-center gap-2.5 rounded-full border border-whatsapp/30 bg-whatsapp/5 px-10 text-base font-medium text-whatsapp transition-smooth hover:bg-whatsapp hover:text-white"
        >
          <MessageCircle className="h-5 w-5" />
          Falar no WhatsApp
        </a>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
        {trust.map((t) => (
          <div key={t.label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <t.icon className="h-4 w-4 text-primary/50" />
            <span>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
