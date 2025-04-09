import { NextResponse } from "next/server"
import { createStripeAccount, createAccountLink } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const { storeId, email } = await req.json()

    if (!storeId || !email) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if user is authorized to connect this store
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get store details
    const { data: store } = await supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .eq("owner_id", session.user.id)
      .single()

    if (!store) {
      return NextResponse.json({ message: "Store not found or you don't have permission" }, { status: 404 })
    }

    // Check if store already has a Stripe account
    let stripeAccountId = store.stripe_account_id

    if (!stripeAccountId) {
      // Create a new Stripe account
      const account = await createStripeAccount(email)
      stripeAccountId = account.id

      // Update store with Stripe account ID
      await supabase.from("stores").update({ stripe_account_id: stripeAccountId }).eq("id", storeId)
    }

    // Create an account link for onboarding
    const accountLink = await createAccountLink(
      stripeAccountId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stores/${storeId}?refresh=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/stores/${storeId}`,
    )

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error("Stripe connect error:", error)
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 })
  }
}

