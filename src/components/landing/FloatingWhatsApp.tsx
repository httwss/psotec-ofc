import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/config/site";

export const FloatingWhatsApp = () => (
  <a
    href={whatsappLink()}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Falar no WhatsApp"
    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-cta transition-bounce hover:scale-110 animate-pulse-glow"
  >
    <MessageCircle className="h-7 w-7" />
  </a>
);
