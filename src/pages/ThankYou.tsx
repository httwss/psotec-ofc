import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Loader2, Home, MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";

type Order = {
  id: string;
  customer_name: string;
  status: string;
  shipping_method: string;
  shipping_price: number;
  product_price: number;
  total_price: number;
  city: string;
  state: string;
  created_at: string;
  paid_at: string | null;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const statusInfo = (s: string) => {
  switch (s) {
    case "approved":
      return { label: "Pagamento aprovado", color: "bg-green-500/15 text-green-600 border-green-500/30", Icon: CheckCircle2 };
    case "pending":
    case "in_process":
      return { label: "Pagamento pendente", color: "bg-amber-500/15 text-amber-600 border-amber-500/30", Icon: Clock };
    case "rejected":
    case "cancelled":
      return { label: "Pagamento recusado", color: "bg-red-500/15 text-red-600 border-red-500/30", Icon: XCircle };
    default:
      return { label: "Aguardando confirmação", color: "bg-muted text-muted-foreground border-border", Icon: Clock };
  }
};

export default function ThankYou() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let attempts = 0;

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/get-order?id=${encodeURIComponent(orderId)}`,
          { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } }
        );
        if (!res.ok) throw new Error("not found");
        const data = (await res.json()) as Order;
        if (!cancelled) {
          setOrder(data);
          setLoading(false);
        }
        return data.status;
      } catch {
        if (!cancelled) setLoading(false);
        return null;
      }
    };

    fetchOrder().then((status) => {
      // Polling for up to 60s if not approved yet (PIX confirmation via webhook)
      if (status === "approved" || status === "rejected" || status === "cancelled") return;
      const interval = setInterval(async () => {
        attempts += 1;
        const s = await fetchOrder();
        if (attempts >= 15 || s === "approved" || s === "rejected" || s === "cancelled") {
          clearInterval(interval);
        }
      }, 4000);
    });

    return () => { cancelled = true; };
  }, [orderId]);

  const info = statusInfo(order?.status ?? "pending");
  const Icon = info.Icon;
  const wppUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Olá! Acabei de fazer o pedido ${orderId ?? ""} e gostaria de tirar uma dúvida.`
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border ${info.color}`}>
              <Icon className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">
              {order?.status === "approved" ? "Obrigado pela compra!" : "Pedido recebido"}
            </CardTitle>
            <Badge variant="outline" className={`mx-auto mt-2 w-fit ${info.color}`}>
              {info.label}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !order ? (
              <p className="text-center text-muted-foreground">
                Não foi possível localizar seu pedido. Se o pagamento foi feito, ele será processado normalmente.
              </p>
            ) : (
              <>
                <div className="rounded-lg border border-border p-4 text-sm">
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground">Pedido</span>
                    <span className="font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground">Cliente</span>
                    <span>{order.customer_name}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-muted-foreground">Entrega</span>
                    <span>{order.city} / {order.state} · {order.shipping_method}</span>
                  </div>
                  <div className="mt-3 space-y-1 border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produto</span>
                      <span>R$ {Number(order.product_price).toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span>R$ {Number(order.shipping_price).toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-bold">
                      <span>Total</span>
                      <span>R$ {Number(order.total_price).toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold">Próximos passos</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {order.status === "approved" ? (
                      <>
                        <li>Pedido confirmado e em separação.</li>
                        <li>Você receberá o código de rastreio por WhatsApp em até 24h úteis.</li>
                      </>
                    ) : (
                      <>
                        <li>Aguardando confirmação do pagamento (PIX costuma ser instantâneo).</li>
                        <li>Esta página atualiza sozinha. Você também receberá confirmação por e-mail.</li>
                      </>
                    )}
                  </ul>
                </div>
              </>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild variant="outline" className="rounded-xl">
                <a href={wppUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> Falar no WhatsApp
                </a>
              </Button>
              <Button onClick={() => navigate("/")} variant="hero" className="rounded-xl">
                <Home /> Voltar ao início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
