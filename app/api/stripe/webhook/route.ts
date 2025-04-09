import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase-server"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const supabase = createServerClient()

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object

      // Update order status
      if (paymentIntent.metadata.orderId) {
        await supabase.from("orders").update({ status: "paid" }).eq("id", paymentIntent.metadata.orderId)
      }
      break

    case "account.updated":
      const account = event.data.object

      // Update store's Stripe account details
      if (account.metadata.storeId) {
        await supabase
          .from("stores")
          .update({
            stripe_account_id: account.id,
          })
          .eq("id", account.metadata.storeId)
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

