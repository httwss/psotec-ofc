import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Truck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "free-shipping-popup-dismissed";

export const FreeShippingPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) sessionStorage.setItem(STORAGE_KEY, "1");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md overflow-hidden border-primary/20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Truck className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Frete grátis para todo o Brasil!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Comprando <strong className="text-foreground">3 unidades ou mais</strong> da Pomada Psotec, você não paga nada de frete.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-center text-sm">
          <Sparkles className="mr-1 inline h-4 w-4 text-primary" />
          Promoção por tempo limitado
        </div>

        <Button asChild variant="hero" size="lg" className="mt-4 w-full rounded-xl">
          <Link to="/checkout?qty=3" onClick={() => handleClose(false)}>
            Aproveitar agora
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
};
