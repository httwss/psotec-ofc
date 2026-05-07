// Receives Payment Brick formData + order_id, creates payment via MP API, updates order.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  order_id: string;
  formData: {
    token?: string;
    issuer_id?: string;
    payment_method_id: string; // "pix", "bolbradesco", "visa", etc.
    transaction_amount?: number; // ignored — we use the order's amount
    installments?: number;
    payer?: {
      email?: string;
      identification?: { type?: string; number?: string };
      first_name?: string;
      last_name?: string;
    };
  };
  selectedPaymentMethod?: string; // "credit_card" | "pix" | "ticket" | "bank_transfer"
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.order_id || !body?.formData?.payment_method_id) {
      return new Response(JSON.stringify({ error: "Dados incompletos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MP_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!MP_TOKEN) {
      return new Response(JSON.stringify({ error: "Mercado Pago não configurado" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders").select("*").eq("id", body.order_id).single();
    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Pedido não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (order.status === "approved") {
      return new Response(JSON.stringify({ error: "Pedido já pago" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fd = body.formData;
    const amount = Number(order.total_price);

    const paymentBody: Record<string, unknown> = {
      transaction_amount: amount,
      description: "Pomada Psotec",
      payment_method_id: fd.payment_method_id,
      external_reference: order.id,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`,
      payer: {
        email: fd.payer?.email || order.customer_email,
        first_name: fd.payer?.first_name || order.customer_name?.split(" ")[0],
        last_name: fd.payer?.last_name || order.customer_name?.split(" ").slice(1).join(" ") || ".",
        identification: fd.payer?.identification?.number
          ? { type: fd.payer.identification.type || "CPF", number: fd.payer.identification.number }
          : undefined,
      },
    };

    if (fd.token) paymentBody.token = fd.token;
    if (fd.installments) paymentBody.installments = fd.installments;
    if (fd.issuer_id) paymentBody.issuer_id = fd.issuer_id;

    const idempotencyKey = `${order.id}-${Date.now()}`;
    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(paymentBody),
    });

    const payment = await mpRes.json();
    if (!mpRes.ok) {
      console.error("MP error", payment);
      return new Response(
        JSON.stringify({ error: payment?.message || "Falha ao processar pagamento", details: payment }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine method bucket for storage / UI
    const isPix = fd.payment_method_id === "pix";
    const isBoleto = ["bolbradesco", "pec"].includes(fd.payment_method_id);
    const methodLabel = isPix ? "pix" : isBoleto ? "boleto" : "credit_card";

    const txData = payment.point_of_interaction?.transaction_data ?? {};
    const update: Record<string, unknown> = {
      status: payment.status,
      mp_payment_id: String(payment.id),
      payment_method: methodLabel,
    };
    if (payment.status === "approved") update.paid_at = new Date().toISOString();
    if (isPix) {
      update.pix_qr_code = txData.qr_code_base64 ?? null;
      update.pix_qr_code_text = txData.qr_code ?? null;
    }
    if (isBoleto) {
      update.boleto_url = payment.transaction_details?.external_resource_url
        ?? txData.ticket_url ?? null;
    }

    const { error: updErr } = await supabase.from("orders").update(update).eq("id", order.id);
    if (updErr) console.error("Order update error", updErr);

    // Fire-and-forget Telegram notification when already approved (e.g. credit card)
    if (payment.status === "approved") {
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-telegram`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ order_id: order.id }),
        });
      } catch (e) {
        console.error("telegram notify error", e);
      }
    }
    return new Response(
      JSON.stringify({
        order_id: order.id,
        status: payment.status,
        status_detail: payment.status_detail,
        payment_method: methodLabel,
        pix: isPix ? { qr_code_base64: txData.qr_code_base64, qr_code: txData.qr_code } : undefined,
        boleto_url: isBoleto ? (payment.transaction_details?.external_resource_url ?? txData.ticket_url) : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
