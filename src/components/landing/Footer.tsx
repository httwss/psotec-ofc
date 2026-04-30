import { SITE_CONFIG } from "@/config/site";
import logo from "@/assets/psotec-logo.jpeg";

export const Footer = () => (
  <footer className="border-t border-border bg-background py-10">
    <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
      <div className="flex items-center gap-2">
        <img src={logo} alt={`${SITE_CONFIG.brand} logo`} className="h-10 w-10 rounded-full object-cover" />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {SITE_CONFIG.brand}. Todos os direitos reservados.
      </p>
      <p className="text-xs text-muted-foreground">
        Produto de uso adulto. Em caso de dúvidas, consulte um dermatologista.
      </p>
    </div>
  </footer>
);
