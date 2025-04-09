import { notFound } from "next/navigation"
import Image from "next/image"
import { createServerClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import AddToCartButton from "./add-to-cart-button"

export default async function ProductPage({
  params,
}: {
  params: { slug: string; productSlug: string }
}) {
  const supabase = createServerClient()

  // Get store details
  const { data: store } = await supabase.from("stores").select("*").eq("slug", params.slug).eq("active", true).single()

  if (!store) {
    notFound()
  }

  // Get product details
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      product_images (*)
    `)
    .eq("slug", params.productSlug)
    .eq("store_id", store.id)
    .eq("active", true)
    .single()

  if (!product) {
    notFound()
  }

  // Get product categories
  const { data: productCategories } = await supabase
    .from("product_categories")
    .select(`
      categories (*)
    `)
    .eq("product_id", product.id)

  const categories = productCategories ? productCategories.map((pc) => pc.categories) : []

  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
            {product.product_images && product.product_images.length > 0 ? (
              <Image
                src={product.product_images[0].url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">No Image</span>
              </div>
            )}
          </div>
          {product.product_images && product.product_images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.product_images.slice(1).map((image: any) => (
                <div
                  key={image.id}
                  className="aspect-square relative overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800"
                >
                  <Image src={image.url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-lg text-muted-foreground line-through">${product.compare_at_price.toFixed(2)}</span>
            )}
          </div>

          {product.description && (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Description</h3>
              <div className="mt-2 text-slate-500 dark:text-slate-400">{product.description}</div>
            </div>
          )}

          {categories.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Categories</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((category: any) => (
                  <span key={category.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-r-none">
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex h-8 w-12 items-center justify-center border-y">1</div>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-l-none">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">{product.inventory_quantity} available</span>
            </div>

            <AddToCartButton product={product} store={store} />
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">SKU:</span>
              <span className="text-sm text-muted-foreground">{product.sku || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

