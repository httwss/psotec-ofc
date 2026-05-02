import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SITE_CONFIG } from "@/config/site";
import logo from "@/assets/psotec-logo.jpeg";

export const Navbar = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
    <div className="container flex h-16 items-center justify-between px-4">
      <a href="#" className="flex items-center gap-2">
        <img src={logo} alt={`${SITE_CONFIG.brand} logo`} className="h-11 w-11 rounded-full object-cover" />
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
        <Link to="/checkout">Comprar</Link>
      </Button>
    </div>
  </header>
);
