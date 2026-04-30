import { Leaf } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";

export const Footer = () => (
  <footer className="border-t border-border bg-background py-10">
    <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-health">
          <Leaf className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground">{SITE_CONFIG.brand}</span>
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
