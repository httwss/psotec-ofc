import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  customer: {
    name: string;
    email: string;
    phone: string;
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shipping: { method: string; price: number };
  product: { title: string; price: number; quantity: number };
}

function isValid(p: Payload) {
  const c = p?.customer;
  if (!c || !p.shipping || !p.product) return false;
  const required = [
    c.name, c.email, c.phone, c.cep, c.street, c.number,
    c.neighborhood, c.city, c.state,
  ];
  if (required.some((v) => !v || typeof v !== "string" || v.trim().length === 0)) return false;
  if (!/^\S+@\S+\.\S+$/.test(c.email)) return false;
  if (typeof p.shipping.price !== "number" || p.shipping.price < 0) return false;
  if (typeof p.product.price !== "number" || p.product.price < 0) return false;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    if (!isValid(body)) {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MP_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!MP_TOKEN) {
      return new Response(JSON.stringify({ error: "Mercado Pago não configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const totalProduct = body.product.price * body.product.quantity;
    const total = totalProduct + body.shipping.price;

    const { data: order, error: dbError } = await supabase
      .from("orders")
      .insert({
        customer_name: body.customer.name,
        customer_email: body.customer.email,
        customer_phone: body.customer.phone,
        cep: body.customer.cep,
        street: body.customer.street,
        number: body.customer.number,
        complement: body.customer.complement ?? null,
        neighborhood: body.customer.neighborhood,
        city: body.customer.city,
        state: body.customer.state,
        shipping_method: body.shipping.method,
        shipping_price: body.shipping.price,
        product_price: totalProduct,
        total_price: total,
        status: "pending",
      })
      .select()
      .single();

    if (dbError || !order) {
      console.error("DB error", dbError);
      return new Response(JSON.stringify({ error: "Erro ao salvar pedido" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Mercado Pago preference
    const preference = {
      items: [
        {
          id: "psotec",
          title: body.product.title,
          quantity: body.product.quantity,
          currency_id: "BRL",
          unit_price: body.product.price,
        },
      ],
      payer: {
        name: body.customer.name,
        email: body.customer.email,
        phone: { number: body.customer.phone },
        address: {
          zip_code: body.customer.cep.replace(/\D/g, ""),
          street_name: body.customer.street,
          street_number: Number(body.customer.number) || undefined,
        },
      },
      shipments: {
        cost: body.shipping.price,
        mode: "not_specified",
        receiver_address: {
          zip_code: body.customer.cep.replace(/\D/g, ""),
          street_name: body.customer.street,
          street_number: Number(body.customer.number) || undefined,
          city_name: body.customer.city,
          state_name: body.customer.state,
        },
      },
      external_reference: order.id,
      back_urls: {
        success: `${req.headers.get("origin") ?? ""}/?status=success`,
        failure: `${req.headers.get("origin") ?? ""}/?status=failure`,
        pending: `${req.headers.get("origin") ?? ""}/?status=pending`,
      },
      auto_return: "approved",
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      console.error("MP error", mpData);
      return new Response(
        JSON.stringify({ error: "Falha ao criar pagamento", details: mpData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("orders")
      .update({ mp_preference_id: mpData.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        order_id: order.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
