import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/psotec-hero.png";

const PRODUCT = { title: "Pomada Psotec", price: 169, quantity: 1 };
const ORIGIN_CEP = "79830080"; // CEP de origem (remetente)

type Shipping = { id: string; name: string; days: string; price: number };

// Frete simulado por região (estado)
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
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const selectedShipping = useMemo(
    () => shippingOptions.find((s) => s.id === shippingId),
    [shippingOptions, shippingId]
  );
  const total = PRODUCT.price + (selectedShipping?.price ?? 0);

  // ViaCEP autofill
  useEffect(() => {
    const cepDigits = onlyDigits(form.cep);
    if (cepDigits.length !== 8) {
      setShippingOptions([]);
      setShippingId("");
      return;
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
          setShippingOptions([]);
          return;
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
      toast({ title: "Email inválido", variant: "destructive" });
      return false;
    }
    if (onlyDigits(form.cep).length !== 8) {
      toast({ title: "CEP inválido", variant: "destructive" });
      return false;
    }
    if (!selectedShipping) {
      toast({ title: "Selecione uma opção de frete", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedShipping) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            cep: form.cep,
            street: form.street.trim(),
            number: form.number.trim(),
            complement: form.complement.trim() || undefined,
            neighborhood: form.neighborhood.trim(),
            city: form.city.trim(),
            state: form.state.trim().toUpperCase(),
          },
          shipping: { method: selectedShipping.name, price: selectedShipping.price },
          product: PRODUCT,
        },
      });
      if (error) throw error;
      const url = data?.init_point || data?.sandbox_init_point;
      if (!url) throw new Error("URL de pagamento não recebida");
      window.location.href = url;
    } catch (err) {
      toast({
        title: "Erro ao iniciar pagamento",
        description: (err as Error).message,
        variant: "destructive",
      });
      setSubmitting(false);
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

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Seus dados</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={120} required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} required />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                  <Input id="phone" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={20} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Endereço de entrega</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="relative">
                    <Input id="cep" value={form.cep} onChange={(e) => set("cep", formatCEP(e.target.value))} placeholder="00000-000" required />
                    {loadingCep && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
                  </div>
                </div>
                <div className="sm:col-span-5">
                  <Label htmlFor="street">Rua *</Label>
                  <Input id="street" value={form.street} onChange={(e) => set("street", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="number">Nº *</Label>
                  <Input id="number" value={form.number} onChange={(e) => set("number", e.target.value)} required />
                </div>
                <div className="sm:col-span-3">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" value={form.complement} onChange={(e) => set("complement", e.target.value)} />
                </div>
                <div className="sm:col-span-3">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input id="neighborhood" value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} required />
                </div>
                <div className="sm:col-span-4">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} required />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="state">UF *</Label>
                  <Input id="state" maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Frete</CardTitle></CardHeader>
              <CardContent>
                {shippingOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Informe um CEP válido para calcular o frete.
                  </p>
                ) : (
                  <RadioGroup value={shippingId} onValueChange={setShippingId} className="gap-3">
                    {shippingOptions.map((s) => (
                      <label
                        key={s.id}
                        htmlFor={`ship-${s.id}`}
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem id={`ship-${s.id}`} value={s.id} />
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-sm text-muted-foreground">{s.days}</div>
                          </div>
                        </div>
                        <div className="font-semibold">
                          R$ {s.price.toFixed(2).replace(".", ",")}
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <img src={heroImage} alt={PRODUCT.title} className="h-20 w-20 rounded-lg object-cover" />
                  <div>
                    <div className="font-semibold">{PRODUCT.title}</div>
                    <div className="text-sm text-muted-foreground">Quantidade: 1</div>
                  </div>
                </div>
                <div className="space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produto</span>
                    <span>R$ {PRODUCT.price.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span>
                      {selectedShipping
                        ? `R$ ${selectedShipping.price.toFixed(2).replace(".", ",")}`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full rounded-xl"
                  disabled={submitting || !selectedShipping}
                >
                  {submitting ? (
                    <><Loader2 className="animate-spin" /> Processando...</>
                  ) : (
                    <><ShoppingBag /> Finalizar Compra</>
                  )}
                </Button>
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
