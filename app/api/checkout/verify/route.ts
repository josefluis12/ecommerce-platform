import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase-server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ message: "Missing session ID" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get all connected accounts
    const { data: stores } = await supabase
      .from("stores")
      .select("id, stripe_account_id")
      .not("stripe_account_id", "is", null)

    if (!stores || stores.length === 0) {
      return NextResponse.json({ message: "No connected Stripe accounts found" }, { status: 404 })
    }

    // Try to find the session in each connected account
    let session
    let stripeAccountId

    for (const store of stores) {
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId, {
          stripeAccount: store.stripe_account_id,
        })
        if (session) {
          stripeAccountId = store.stripe_account_id
          break
        }
      } catch (error) {
        // Continue to the next account
        continue
      }
    }

    if (!session) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    // Get order details
    const { data: order } = await supabase.from("orders").select("*").eq("id", session.metadata?.orderId).single()

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Update order status if payment was successful
    if (session.payment_status === "paid") {
      await supabase.from("orders").update({ status: "paid" }).eq("id", order.id)
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
    })
  } catch (error: any) {
    console.error("Verify checkout error:", error)
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 })
  }
}

