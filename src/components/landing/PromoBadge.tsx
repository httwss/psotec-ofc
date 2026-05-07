import { Sparkles, Truck } from "lucide-react";
import { Link } from "react-router-dom";

export const PromoBadge = () => (
  <Link
    to="/checkout"
    className="fixed left-3 top-20 z-40 group animate-fade-in"
    aria-label="Promoção: leve 3 e ganhe frete grátis"
  >
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-smooth" style={{ background: "linear-gradient(135deg, hsl(25 95% 55%), hsl(0 90% 55%))" }} />
      <div
        className="relative flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-cta animate-pulse-glow border-2 border-white/30"
        style={{ background: "linear-gradient(135deg, hsl(35 100% 55%), hsl(10 95% 55%))", color: "hsl(0 0% 100%)" }}
      >
        <Sparkles className="h-6 w-6 shrink-0" />
        <div className="leading-tight">
          <p className="text-xs font-bold uppercase tracking-wider opacity-95">Promoção</p>
          <p className="text-base font-extrabold flex items-center gap-1.5">
            Leve 3 + <Truck className="h-4 w-4" /> Frete Grátis
          </p>
        </div>
      </div>
    </div>
  </Link>
);
