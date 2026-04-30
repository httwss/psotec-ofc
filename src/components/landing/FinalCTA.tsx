import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingBag, CheckCircle2 } from "lucide-react";
import { whatsappLink, SITE_CONFIG } from "@/config/site";

const guarantees = [
  "Entrega para todo o Brasil",
  "Garantia de satisfação",
  "Pagamento 100% seguro",
];

export const FinalCTA = () => (
  <section className="relative overflow-hidden py-20 md:py-28">
    <div className="absolute inset-0 gradient-health" />
    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
    <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />

    <div className="container relative px-4 text-center">
      <h2 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground sm:text-5xl md:text-6xl">
        Sua pele merece esse{" "}
        <span className="underline decoration-secondary-glow decoration-4 underline-offset-4">novo começo</span>
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
        Comece hoje o tratamento com Psotec e sinta a diferença em poucos dias. Fale agora com nossa equipe pelo WhatsApp.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button asChild variant="whatsapp" size="xl" className="rounded-2xl animate-pulse-glow">
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <MessageCircle /> Comprar pelo WhatsApp
          </a>
        </Button>
        <Button asChild size="xl" variant="outline" className="rounded-2xl border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary">
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            <ShoppingBag /> Comprar Agora
          </a>
        </Button>
      </div>

      <p className="mt-6 text-sm font-medium text-primary-foreground/80">
        Atendimento direto: <strong>+{SITE_CONFIG.whatsappNumber}</strong>
      </p>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
        {guarantees.map((g) => (
          <div key={g} className="flex items-center gap-2 text-primary-foreground">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">{g}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
