import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, LogOut, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  shipping_method: string;
  shipping_price: number;
  product_price: number;
  total_price: number;
  status: string;
  tracking_code: string | null;
  paid_at: string | null;
  created_at: string;
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    approved: "bg-green-500/15 text-green-600 border-green-500/30",
    pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    in_process: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    rejected: "bg-red-500/15 text-red-600 border-red-500/30",
    cancelled: "bg-red-500/15 text-red-600 border-red-500/30",
    shipped: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  };
  return map[s] ?? "bg-muted text-muted-foreground";
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate("/auth");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id);
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      setAuthorized(isAdmin);
      if (isAdmin) await load();
      else setLoading(false);
    })();
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) toast({ title: "Erro ao carregar pedidos", description: error.message, variant: "destructive" });
    else setOrders((data ?? []) as Order[]);
  };

  const markShipped = async (id: string) => {
    const code = trackingDrafts[id]?.trim();
    if (!code) {
      toast({ title: "Informe o código de rastreio", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("orders")
      .update({ status: "shipped", tracking_code: code })
      .eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Pedido marcado como enviado" });
      await load();
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (authorized === false) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md">
          <CardHeader><CardTitle>Acesso negado</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sua conta não tem permissão de administrador.
            </p>
            <Button onClick={signOut} variant="outline" className="w-full">
              <LogOut /> Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
            <Package className="h-6 w-6" /> Pedidos
          </h1>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="shipped">Enviados</SelectItem>
                <SelectItem value="rejected">Recusados</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={signOut}><LogOut /></Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum pedido encontrado.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => (
              <Card key={o.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </span>
                        <Badge variant="outline" className={statusBadge(o.status)}>{o.status}</Badge>
                      </div>
                      <div className="mt-1 font-semibold">{o.customer_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {o.customer_email} · {o.customer_phone}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        R$ {Number(o.total_price).toFixed(2).replace(".", ",")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm md:grid-cols-2">
                  <div>
                    <div className="mb-1 font-semibold">Endereço</div>
                    <div className="text-muted-foreground">
                      {o.street}, {o.number} {o.complement ? `· ${o.complement}` : ""}<br />
                      {o.neighborhood} · {o.city}/{o.state} · CEP {o.cep}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-semibold">Frete</div>
                    <div className="text-muted-foreground">
                      {o.shipping_method} · R$ {Number(o.shipping_price).toFixed(2).replace(".", ",")}
                    </div>
                    {o.tracking_code && (
                      <div className="mt-2 text-xs">
                        Rastreio: <span className="font-mono">{o.tracking_code}</span>
                      </div>
                    )}
                  </div>
                  {o.status === "approved" && (
                    <div className="md:col-span-2 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      <Input
                        placeholder="Código de rastreio"
                        value={trackingDrafts[o.id] ?? ""}
                        onChange={(e) =>
                          setTrackingDrafts((d) => ({ ...d, [o.id]: e.target.value }))
                        }
                        className="max-w-xs"
                      />
                      <Button onClick={() => markShipped(o.id)} variant="hero">
                        Marcar como enviado
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
