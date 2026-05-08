import { Link } from "react-router-dom";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";
import { whatsappLink } from "@/config/site";
import logo from "@/assets/psotec-logo.jpeg";

export const Navbar = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-white/90 backdrop-blur-md">
    <div className="container flex h-16 items-center justify-between px-6">
      <a href="#" className="flex items-center gap-2.5">
        <img src={logo} alt={`${SITE_CONFIG.brand} logo`} className="h-9 w-9 rounded-full object-cover" />
        <span className="font-display text-lg text-foreground">
          {SITE_CONFIG.brand}
        </span>
      </a>

      <nav className="hidden items-center gap-8 md:flex">
        {[
          { href: "#beneficios", label: "Beneficios" },
          { href: "#resultados", label: "Resultados" },
          { href: "#depoimentos", label: "Depoimentos" },
          { href: "#sobre", label: "Sobre" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground transition-smooth hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Link
          to="/checkout"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white shadow-sm transition-smooth hover:bg-primary/90"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Comprar</span>
        </Link>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-whatsapp px-4 text-sm font-medium text-white shadow-sm transition-smooth hover:bg-whatsapp/90 sm:px-5"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </div>
  </header>
);
