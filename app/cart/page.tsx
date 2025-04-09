"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"

interface CartItem {
  productId: string
  quantity: number
  product: any
}

interface Cart {
  items: CartItem[]
  storeId: string
  storeName: string
}

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get cart from localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
    setIsLoading(false)
  }, [])

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (!cart) return

    if (newQuantity < 1) {
      removeItem(productId)
      return
    }

    const updatedItems = cart.items.map((item) => {
      if (item.productId === productId) {
        return { ...item, quantity: newQuantity }
      }
      return item
    })

    const updatedCart = { ...cart, items: updatedItems }
    setCart(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  const removeItem = (productId: string) => {
    if (!cart) return

    const updatedItems = cart.items.filter((item) => item.productId !== productId)

    if (updatedItems.length === 0) {
      // Clear cart if no items left
      localStorage.removeItem("cart")
      setCart(null)
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })
    } else {
      const updatedCart = { ...cart, items: updatedItems }
      setCart(updatedCart)
      localStorage.setItem("cart", JSON.stringify(updatedCart))
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      })
    }
  }

  const clearCart = () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) {
      return
    }

    localStorage.removeItem("cart")
    setCart(null)
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const calculateSubtotal = () => {
    if (!cart) return 0

    return cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">Your cart is empty</h3>
          <p className="mb-6 text-muted-foreground">Looks like you haven't added any products to your cart yet.</p>
          <Button asChild>
            <Link href="/stores">Browse Stores</Link>
          </Button>
        </div>
      </div>
    )
  }

  const subtotal = calculateSubtotal()

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-md border">
            <div className="grid grid-cols-12 border-b p-4 font-medium">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {cart.items.map((item) => (
              <div key={item.productId} className="grid grid-cols-12 items-center border-b p-4">
                <div className="col-span-6 flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-slate-100">
                    {item.product.product_images && item.product.product_images.length > 0 ? (
                      <Image
                        src={item.product.product_images[0].url || "/placeholder.svg"}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-sm text-red-500"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="col-span-2 text-center">${item.product.price.toFixed(2)}</div>
                <div className="col-span-2 flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, Number.parseInt(e.target.value) || 1)}
                    className="h-8 w-12 rounded-none border-x-0 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="col-span-2 text-right font-medium">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
            <Button asChild variant="outline">
              <Link href={`/stores/${cart.storeName}`}>Continue Shopping</Link>
            </Button>
          </div>
        </div>
        <div>
          <div className="rounded-md border p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Button className="mt-6 w-full" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

