import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import ProductForm from "../product-form"

export default async function EditProductPage({
  params,
}: {
  params: { id: string; productId: string }
}) {
  const supabase = createServerClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth")
  }

  // Get store details
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", params.id)
    .eq("owner_id", session.user.id)
    .single()

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
    .eq("id", params.productId)
    .eq("store_id", params.id)
    .single()

  if (!product) {
    notFound()
  }

  // Get product categories
  const { data: productCategories } = await supabase
    .from("product_categories")
    .select("category_id")
    .eq("product_id", params.productId)

  // Get all categories
  const { data: categories } = await supabase.from("categories").select("*").order("name", { ascending: true })

  // Add selected categories to product
  const productWithCategories = {
    ...product,
    categoryIds: productCategories?.map((pc) => pc.category_id) || [],
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Update your product information</p>
      </div>
      <ProductForm storeId={store.id} categories={categories || []} initialData={productWithCategories} />
    </div>
  )
}

