import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import ProductForm from "../product-form"

export default async function NewProductPage({
  params,
}: {
  params: { id: string }
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

  // Get categories
  const { data: categories } = await supabase.from("categories").select("*").order("name", { ascending: true })

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Add a new product to your store</p>
      </div>
      <ProductForm storeId={store.id} categories={categories || []} initialData={null} />
    </div>
  )
}

