import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
})

export async function createStripeAccount(email: string) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  return account
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  })

  return accountLink
}

export async function createPaymentIntent(
  amount: number,
  currency = "usd",
  applicationFeeAmount: number,
  stripeAccountId: string,
  metadata: Record<string, string> = {},
) {
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount,
      currency,
      application_fee_amount: applicationFeeAmount,
      metadata,
    },
    {
      stripeAccount: stripeAccountId,
    },
  )

  return paymentIntent
}

