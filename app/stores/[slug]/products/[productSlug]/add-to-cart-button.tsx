"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddToCartButtonProps {
  product: any
  store: any
}

export default function AddToCartButton({ product, store }: AddToCartButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const addToCart = () => {
    setIsLoading(true)

    // Get existing cart from localStorage
    const existingCart = localStorage.getItem("cart")
    const cart = existingCart ? JSON.parse(existingCart) : { items: [], storeId: null }

    // Check if product is from the same store
    if (cart.storeId && cart.storeId !== store.id) {
      toast({
        title: "Items from different stores",
        description:
          "Your cart contains items from a different store. Would you like to clear your cart and add this item?",
        action: (
          <Button
            variant="outline"
            onClick={() => {
              // Clear cart and add new item
              const newCart = {
                items: [{ productId: product.id, quantity: 1, product }],
                storeId: store.id,
                storeName: store.name,
              }
              localStorage.setItem("cart", JSON.stringify(newCart))
              toast({
                title: "Added to cart",
                description: `${product.name} has been added to your cart.`,
              })
              router.refresh()
            }}
          >
            Clear Cart
          </Button>
        ),
      })
      setIsLoading(false)
      return
    }

    // Add product to cart
    const existingItemIndex = cart.items.findIndex((item: any) => item.productId === product.id)

    if (existingItemIndex > -1) {
      // Increment quantity if product already in cart
      cart.items[existingItemIndex].quantity += 1
    } else {
      // Add new product to cart
      cart.items.push({
        productId: product.id,
        quantity: 1,
        product,
      })
    }

    // Set store info if not already set
    if (!cart.storeId) {
      cart.storeId = store.id
      cart.storeName = store.name
    }

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })

    setIsLoading(false)
    router.refresh()
  }

  return (
    <Button onClick={addToCart} disabled={isLoading} className="w-full">
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  )
}

