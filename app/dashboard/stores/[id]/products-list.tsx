"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus } from "lucide-react"

interface ProductsListProps {
  products: any[]
  storeId: string
}

export default function ProductsList({ products, storeId }: ProductsListProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    setIsDeleting(productId)

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("products").update({ active: !currentStatus }).eq("id", productId)

      if (error) throw error

      toast({
        title: `Product ${!currentStatus ? "activated" : "deactivated"}`,
        description: `The product has been ${!currentStatus ? "activated" : "deactivated"} successfully.`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      {products.length > 0 ? (
        <div className="rounded-md border">
          <div className="grid grid-cols-6 border-b p-4 font-medium">
            <div className="col-span-2">Product</div>
            <div>Price</div>
            <div>Inventory</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          {products.map((product) => (
            <div key={product.id} className="grid grid-cols-6 items-center p-4">
              <div className="col-span-2 flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-md bg-slate-100">
                  {product.product_images && product.product_images.length > 0 ? (
                    <img
                      src={product.product_images[0].url || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground">{product.sku || "No SKU"}</div>
                </div>
              </div>
              <div>${product.price.toFixed(2)}</div>
              <div>{product.inventory_quantity}</div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/stores/${storeId}/products/${product.id}`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleProductStatus(product.id, product.active)}>
                      {product.active ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={isDeleting === product.id}
                    >
                      {isDeleting === product.id ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
          <h3 className="mb-2 text-xl font-semibold">No products yet</h3>
          <p className="mb-6 text-center text-muted-foreground">Add your first product to start selling.</p>
          <Button asChild>
            <Link href={`/dashboard/stores/${storeId}/products/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

