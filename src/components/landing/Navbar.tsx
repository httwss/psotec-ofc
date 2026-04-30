import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import { whatsappLink, SITE_CONFIG } from "@/config/site";

export const Navbar = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
    <div className="container flex h-16 items-center justify-between px-4">
      <a href="#" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-health">
          <Leaf className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          {SITE_CONFIG.brand}
        </span>
      </a>
      <nav className="hidden items-center gap-8 md:flex">
        <a href="#beneficios" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">Benefícios</a>
        <a href="#resultados" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">Resultados</a>
        <a href="#depoimentos" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">Depoimentos</a>
        <a href="#sobre" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary">Sobre</a>
      </nav>
      <Button asChild variant="whatsapp" size="sm" className="rounded-full">
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">Comprar</a>
      </Button>
    </div>
  </header>
);
