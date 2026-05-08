import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ShoppingBag, ArrowLeft, Minus, Plus, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import heroImage from "@/assets/psotec-hero.png";

const PRODUCT = { title: "Pomada Psotec", price: 169 };
const FREE_SHIPPING_MIN_QTY = 3;
const MP_PUBLIC_KEY = "APP_USR-f58b80f2-818a-4984-b880-e90e999238c7";

initMercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });

type Shipping = { id: string; name: string; days: string; price: number };

function calcShipping(destState: string): Shipping[] {
  const sameRegion = ["MS", "MT", "GO", "DF", "SP", "PR"];
  const isSame = sameRegion.includes(destState.toUpperCase());
  if (isSame) {
    return [
      { id: "PAC", name: "PAC", days: "5-8 dias úteis", price: 19.9 },
      { id: "SEDEX", name: "SEDEX", days: "2-3 dias úteis", price: 32.5 },
    ];
  }
  return [
    { id: "PAC", name: "PAC", days: "8-14 dias úteis", price: 29.9 },
    { id: "SEDEX", name: "SEDEX", days: "3-5 dias úteis", price: 49.9 },
  ];
}

const onlyDigits = (s: string) => s.replace(/\D/g, "");
const formatCEP = (s: string) => {
  const d = onlyDigits(s).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

export default function Checkout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    cep: "", street: "", number: "", complement: "",
    neighborhood: "", city: "", state: "",
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<Shipping[]>([]);
  const [shippingId, setShippingId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isFreeShipping = quantity >= FREE_SHIPPING_MIN_QTY;
  const selectedShipping = useMemo(
    () => shippingOptions.find((s) => s.id === shippingId),
    [shippingOptions, shippingId]
  );
  const productSubtotal = PRODUCT.price * quantity;
  const shippingCost = isFreeShipping ? 0 : (selectedShipping?.price ?? 0);
  const total = productSubtotal + shippingCost;

  useEffect(() => {
    const cepDigits = onlyDigits(form.cep);
    if (cepDigits.length !== 8) {
      setShippingOptions([]); setShippingId(""); return;
    }
    let cancelled = false;
    (async () => {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
        const data = await res.json();
        if (cancelled) return;
        if (data.erro) {
          toast({ title: "CEP não encontrado", variant: "destructive" });
          setShippingOptions([]); return;
        }
        setForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          state: data.uf || f.state,
        }));
        const opts = calcShipping(data.uf || "");
        setShippingOptions(opts);
        setShippingId(opts[0]?.id ?? "");
      } catch {
        if (!cancelled) toast({ title: "Erro ao consultar CEP", variant: "destructive" });
      } finally {
        if (!cancelled) setLoadingCep(false);
      }
    })();
    return () => { cancelled = true; };
  }, [form.cep]);

  const validate = () => {
    const required: (keyof typeof form)[] = [
      "name","email","phone","cep","street","number","neighborhood","city","state",
    ];
    for (const k of required) {
      if (!form[k].trim()) {
        toast({ title: `Preencha o campo: ${k}`, variant: "destructive" });
        return false;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast({ title: "Email inválido", variant: "destructive" }); return false;
    }
    if (onlyDigits(form.cep).length !== 8) {
      toast({ title: "CEP inválido", variant: "destructive" }); return false;
    }
    if (!selectedShipping) {
      toast({ title: "Selecione uma opção de frete", variant: "destructive" }); return false;
    }
    return true;
  };

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedShipping) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          customer: {
            name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
            cep: form.cep, street: form.street.trim(), number: form.number.trim(),
            complement: form.complement.trim() || undefined,
            neighborhood: form.neighborhood.trim(), city: form.city.trim(),
            state: form.state.trim().toUpperCase(),
          },
          shipping: {
            method: isFreeShipping ? `${selectedShipping.name} (Grátis)` : selectedShipping.name,
            price: isFreeShipping ? 0 : selectedShipping.price,
          },
          product: { ...PRODUCT, quantity },
        },
      });
      if (error) throw error;
      if (!data?.order_id) throw new Error("Pedido não criado");
      setOrderId(data.order_id);
      // Scroll to payment widget
      setTimeout(() => {
        document.getElementById("mp-payment-brick")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      toast({
        title: "Erro ao iniciar pagamento",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight md:text-4xl">
          Finalizar Compra
        </h1>

        <form onSubmit={handleContinueToPayment} className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Seus dados</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={120} required disabled={!!orderId} />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} required disabled={!!orderId} />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                  <Input id="phone" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={20} required disabled={!!orderId} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Endereço de entrega</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="relative">
                    <Input id="cep" value={form.cep} onChange={(e) => set("cep", formatCEP(e.target.value))} placeholder="00000-000" required disabled={!!orderId} />
                    {loadingCep && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
                  </div>
                </div>
                <div className="sm:col-span-5">
                  <Label htmlFor="street">Rua *</Label>
                  <Input id="street" value={form.street} onChange={(e) => set("street", e.target.value)} required disabled={!!orderId} />
                </div>
                <div>
                  <Label htmlFor="number">Nº *</Label>
                  <Input id="number" value={form.number} onChange={(e) => set("number", e.target.value)} required disabled={!!orderId} />
                </div>
                <div className="sm:col-span-3">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" value={form.complement} onChange={(e) => set("complement", e.target.value)} disabled={!!orderId} />
                </div>
                <div className="sm:col-span-3">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input id="neighborhood" value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} required disabled={!!orderId} />
                </div>
                <div className="sm:col-span-4">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} required disabled={!!orderId} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="state">UF *</Label>
                  <Input id="state" maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} required disabled={!!orderId} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Frete</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {isFreeShipping && (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm font-semibold text-primary">
                    <Truck className="h-4 w-4" />
                    Frete grátis aplicado! 🎉 (3+ unidades)
                  </div>
                )}
                {shippingOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Informe um CEP válido para calcular o frete.</p>
                ) : (
                  <RadioGroup value={shippingId} onValueChange={setShippingId} className="gap-3" disabled={!!orderId}>
                    {shippingOptions.map((s) => (
                      <label key={s.id} htmlFor={`ship-${s.id}`}
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem id={`ship-${s.id}`} value={s.id} />
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-sm text-muted-foreground">{s.days}</div>
                          </div>
                        </div>
                        <div className="font-semibold">
                          {isFreeShipping ? (
                            <span className="text-primary">Grátis</span>
                          ) : (
                            `R$ ${s.price.toFixed(2).replace(".", ",")}`
                          )}
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {orderId && (
              <Card id="mp-payment-brick">
                <CardHeader>
                  <CardTitle>Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <Payment
                    initialization={{
                      amount: total,
                      payer: { email: form.email },
                    }}
                    customization={{
                      paymentMethods: {
                        creditCard: "all",
                        bankTransfer: ["pix"],
                        ticket: "all",
                        maxInstallments: 12,
                      },
                    }}
                    onSubmit={async ({ formData, selectedPaymentMethod }) => {
                      try {
                        const { data, error } = await supabase.functions.invoke("process-payment", {
                          body: { order_id: orderId, formData, selectedPaymentMethod },
                        });
                        if (error) throw error;
                        if (data?.error) throw new Error(data.error);
                        navigate(`/obrigado?order=${orderId}`);
                      } catch (err) {
                        toast({
                          title: "Pagamento não autorizado",
                          description: (err as Error).message,
                          variant: "destructive",
                        });
                        throw err;
                      }
                    }}
                    onError={(err) => {
                      console.error("Brick error", err);
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <img src={heroImage} alt={PRODUCT.title} className="h-20 w-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold">{PRODUCT.title}</div>
                    <div className="text-sm text-muted-foreground">R$ {PRODUCT.price.toFixed(2).replace(".", ",")} / un</div>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-border">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={!!orderId || quantity <= 1}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="min-w-6 text-center text-sm font-semibold">{quantity}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => setQuantity((q) => Math.min(99, q + 1))} disabled={!!orderId}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {!isFreeShipping ? (
                  <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 text-xs text-foreground">
                    🚚 Adicione mais <strong>{FREE_SHIPPING_MIN_QTY - quantity}</strong>{" "}
                    {FREE_SHIPPING_MIN_QTY - quantity === 1 ? "unidade" : "unidades"} e ganhe <strong>frete grátis</strong>!
                  </div>
                ) : (
                  <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-semibold text-primary">
                    🎉 Você ganhou frete grátis!
                  </div>
                )}

                <div className="space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produto ({quantity}x)</span>
                    <span>R$ {productSubtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span>
                      {isFreeShipping ? (
                        <span className="font-semibold text-primary">Grátis</span>
                      ) : selectedShipping ? (
                        `R$ ${selectedShipping.price.toFixed(2).replace(".", ",")}`
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
                {!orderId ? (
                  <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl"
                    disabled={creating || !selectedShipping}>
                    {creating ? (<><Loader2 className="animate-spin" /> Processando...</>)
                      : (<><ShoppingBag /> Continuar para pagamento</>)}
                  </Button>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Escolha a forma de pagamento abaixo
                  </p>
                )}
                <p className="text-center text-xs text-muted-foreground">
                  Pagamento seguro via Mercado Pago
                </p>
              </CardContent>
            </Card>
          </aside>
        </form>
      </div>
    </div>
  );
}
