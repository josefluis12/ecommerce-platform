import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const { orderId, items, customerEmail, stripeAccountId, commission } = await req.json()

    if (!orderId || !items || !items.length || !stripeAccountId) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get store details
    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Calculate total amount in cents
    const amount = Math.round(order.total_amount * 100)
    const applicationFeeAmount = Math.round(commission * 100)

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          description: item.product.description || undefined,
          images: item.product.product_images?.length ? [item.product.product_images[0].url] : undefined,
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
        customer_email: customerEmail,
        metadata: {
          orderId,
        },
        payment_intent_data: {
          application_fee_amount: applicationFeeAmount,
          metadata: {
            orderId,
          },
        },
      },
      {
        stripeAccount: stripeAccountId,
      },
    )

    // Update order with Stripe session ID
    await supabase
      .from("orders")
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq("id", orderId)

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 })
  }
}

