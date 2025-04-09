"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isLoading, setIsLoading] = useState(true)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      // Clear cart
      localStorage.removeItem("cart")

      // Get order details
      fetch(`/api/checkout/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orderNumber) {
            setOrderNumber(data.orderNumber)
          }
        })
        .catch((error) => {
          console.error("Error verifying checkout:", error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center py-10">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <CardDescription>Thank you for your purchase. Your order has been received.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {orderNumber && (
            <p className="text-sm text-muted-foreground">
              Your order number is <span className="font-medium">{orderNumber}</span>
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">We've sent a confirmation email with your order details.</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/orders">View Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/stores">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

