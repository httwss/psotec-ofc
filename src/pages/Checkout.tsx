import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader as Loader2, ShoppingBag, ArrowLeft, Minus, Plus, Truck, ShieldCheck, Lock } from "lucide-react";
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
      { id: "PAC", name: "PAC", days: "5-8 dias uteis", price: 19.9 },
      { id: "SEDEX", name: "SEDEX", days: "2-3 dias uteis", price: 32.5 },
    ];
  }
  return [
    { id: "PAC", name: "PAC", days: "8-14 dias uteis", price: 29.9 },
    { id: "SEDEX", name: "SEDEX", days: "3-5 dias uteis", price: 49.9 },
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
          toast({ title: "CEP nao encontrado", variant: "destructive" });
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
      toast({ title: "Email invalido", variant: "destructive" }); return false;
    }
    if (onlyDigits(form.cep).length !== 8) {
      toast({ title: "CEP invalido", variant: "destructive" }); return false;
    }
    if (!selectedShipping) {
      toast({ title: "Selecione uma opcao de frete", variant: "destructive" }); return false;
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
            method: isFreeShipping ? `${selectedShipping.name} (Gratis)` : selectedShipping.name,
            price: isFreeShipping ? 0 : selectedShipping.price,
          },
          product: { ...PRODUCT, quantity },
        },
      });
      if (error) throw error;
      if (!data?.order_id) throw new Error("Pedido nao criado");
      setOrderId(data.order_id);
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
    <div className="min-h-screen bg-white">
      <div className="container max-w-5xl px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-smooth hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <h1 className="font-display text-3xl leading-tight text-foreground md:text-4xl">
          Finalizar Compra
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Preencha seus dados para concluir o pedido
        </p>

        <form onSubmit={handleContinueToPayment} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Customer info */}
            <Card className="border-border/60 shadow-soft">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Seus dados</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name" className="text-xs text-muted-foreground">Nome completo</Label>
                  <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={120} required disabled={!!orderId} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} required disabled={!!orderId} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs text-muted-foreground">Telefone / WhatsApp</Label>
                  <Input id="phone" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={20} required disabled={!!orderId} className="mt-1.5" />
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="border-border/60 shadow-soft">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Endereco de entrega</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label htmlFor="cep" className="text-xs text-muted-foreground">CEP</Label>
                  <div className="relative mt-1.5">
                    <Input id="cep" value={form.cep} onChange={(e) => set("cep", formatCEP(e.target.value))} placeholder="00000-000" required disabled={!!orderId} />
                    {loadingCep && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
                  </div>
                </div>
                <div className="sm:col-span-5">
                  <Label htmlFor="street" className="text-xs text-muted-foreground">Rua</Label>
                  <Input id="street" value={form.street} onChange={(e) => set("street", e.target.value)} required disabled={!!orderId} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="number" className="text-xs text-muted-foreground">No.</Label>
                  <Input id="number" value={form.number} onChange={(e) => set("number", e.target.value)} required disabled={!!orderId} className="mt-1.5" />
                </div>
                <div className="sm:col-span-3">
                  <Label htmlFor="complement" className="text-xs text-muted-foreground">Complemento</Label>
                  <Input id="complement" value={form.complement} onChange={(e) => set("complement", e.target.value)} disabled={!!orderId} className="mt-1.5" />
                </div>
                <div className="sm:col-span-3">
                  <Label htmlFor="neighborhood" className="text-xs text-muted-foreground">Bairro</Label>
                  <Input id="neighborhood" value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} required disabled={!!orderId} className="mt-1.5" />
                </div>
                <div className="sm:col-span-4">
                  <Label htmlFor="city" className="text-xs text-muted-foreground">Cidade</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} required disabled={!!orderId} className="mt-1.5" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="state" className="text-xs text-muted-foreground">UF</Label>
                  <Input id="state" maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} required disabled={!!orderId} className="mt-1.5" />
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card className="border-border/60 shadow-soft">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Frete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isFreeShipping && (
                  <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm font-medium text-primary">
                    <Truck className="h-4 w-4" />
                    Frete gratis aplicado (3+ unidades)
                  </div>
                )}
                {shippingOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Informe um CEP valido para calcular o frete.</p>
                ) : (
                  <RadioGroup value={shippingId} onValueChange={setShippingId} className="gap-3" disabled={!!orderId}>
                    {shippingOptions.map((s) => (
                      <label key={s.id} htmlFor={`ship-${s.id}`}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-border/60 p-4 transition-smooth hover:bg-accent/50 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem id={`ship-${s.id}`} value={s.id} />
                          <div>
                            <div className="text-sm font-semibold">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.days}</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          {isFreeShipping ? (
                            <span className="text-primary">Gratis</span>
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

            {/* Payment */}
            {orderId && (
              <Card id="mp-payment-brick" className="border-border/60 shadow-soft">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-lg">Pagamento</CardTitle>
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
                          title: "Pagamento nao autorizado",
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

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card className="border-border/60 shadow-soft">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex gap-4">
                  <img src={heroImage} alt={PRODUCT.title} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{PRODUCT.title}</div>
                    <div className="text-xs text-muted-foreground">R$ {PRODUCT.price.toFixed(2).replace(".", ",")} / un</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border/60">
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
                  <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 text-xs text-foreground/80">
                    Adicione mais <strong>{FREE_SHIPPING_MIN_QTY - quantity}</strong>{" "}
                    {FREE_SHIPPING_MIN_QTY - quantity === 1 ? "unidade" : "unidades"} e ganhe <strong className="text-primary">frete gratis</strong>
                  </div>
                ) : (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs font-medium text-primary">
                    Voce ganhou frete gratis
                  </div>
                )}

                <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produto ({quantity}x)</span>
                    <span>R$ {productSubtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span>
                      {isFreeShipping ? (
                        <span className="font-semibold text-primary">Gratis</span>
                      ) : selectedShipping ? (
                        `R$ ${selectedShipping.price.toFixed(2).replace(".", ",")}`
                      ) : (
                        "---"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-3 text-base font-semibold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>

                {!orderId ? (
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-primary text-white hover:bg-primary/90"
                    disabled={creating || !selectedShipping}
                  >
                    {creating ? (<><Loader2 className="animate-spin" /> Processando...</>)
                      : (<><ShoppingBag /> Continuar para pagamento</>)}
                  </Button>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Escolha a forma de pagamento abaixo
                  </p>
                )}

                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Pagamento seguro via Mercado Pago
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary/50" />
                Compra segura
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary/50" />
                Entrega nacional
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
