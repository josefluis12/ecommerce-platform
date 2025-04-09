import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createServerClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"

export default async function StorePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createServerClient()

  // Get store details
  const { data: store } = await supabase.from("stores").select("*").eq("slug", params.slug).eq("active", true).single()

  if (!store) {
    notFound()
  }

  // Get store products
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      product_images (*)
    `)
    .eq("store_id", store.id)
    .eq("active", true)
    .order("created_at", { ascending: false })

  return (
    <div>
      {/* Store Header */}
      <div
        className="relative h-48 bg-cover bg-center md:h-64"
        style={{
          backgroundColor: store.theme_color || "#4F46E5",
          backgroundImage: store.banner_url ? `url(${store.banner_url})` : "none",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="container relative z-10 flex h-full flex-col items-center justify-center text-white">
          {store.logo_url ? (
            <Image
              src={store.logo_url || "/placeholder.svg"}
              alt={store.name}
              width={80}
              height={80}
              className="mb-4 h-20 w-20 rounded-full bg-white object-contain p-1"
            />
          ) : (
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-bold text-slate-800">
              {store.name.charAt(0)}
            </div>
          )}
          <h1 className="text-3xl font-bold">{store.name}</h1>
          {store.description && <p className="mt-2 max-w-2xl text-center text-white/90">{store.description}</p>}
        </div>
      </div>

      {/* Store Content */}
      <div className="container py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Products</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products && products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} store={store} />)
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <h3 className="mb-2 text-xl font-semibold">No products yet</h3>
              <p className="mb-6 text-muted-foreground">This store hasn't added any products yet.</p>
              <Button asChild variant="outline">
                <Link href="/stores">Browse Other Stores</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

