import { SITE_CONFIG, whatsappLink } from "@/config/site";
import logo from "@/assets/psotec-logo.jpeg";

export const Footer = () => (
  <footer className="border-t border-border bg-background py-12">
    <div className="container px-4">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt={`${SITE_CONFIG.brand} logo`} className="h-10 w-10 rounded-full object-cover" />
            <span className="font-bold text-foreground">{SITE_CONFIG.brand}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Pomada dermatológica para alívio dos sintomas da psoríase. Uso adulto.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-foreground">Atendimento</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-smooth">
                WhatsApp: +{SITE_CONFIG.whatsappNumber}
              </a>
            </li>
            <li>
              <a href="mailto:atendimentoaosclientes@gmail.com" className="hover:text-primary transition-smooth">
                atendimentoaosclientes@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 md:flex-row">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_CONFIG.brand}. Todos os direitos reservados.
        </p>
        <p className="text-center text-xs text-muted-foreground md:text-right">
          Produto de uso adulto. Resultados podem variar. Em caso de dúvidas, consulte um dermatologista.
        </p>
      </div>
    </div>
  </footer>
);
