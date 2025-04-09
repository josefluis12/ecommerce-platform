import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardNav from "../../dashboard-nav"
import StoreSettings from "./store-settings"
import ProductsList from "./products-list"

export default async function StoreDashboardPage({
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

  // Get store products
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      product_images (*)
    `)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

  // Get store orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto w-full grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      <aside className="hidden w-[200px] flex-col md:flex lg:w-[250px]">
        <DashboardNav />
      </aside>
      <main className="flex w-full flex-col overflow-hidden">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">{store.name}</h2>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href={`/stores/${store.slug}`} target="_blank">
                  View Store
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/stores/${store.id}/products/new`}>Add Product</Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="products" className="space-y-4">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              <ProductsList products={products || []} storeId={store.id} />
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              {orders && orders.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 border-b p-4 font-medium">
                    <div>Order</div>
                    <div>Date</div>
                    <div>Customer</div>
                    <div>Status</div>
                    <div className="text-right">Total</div>
                  </div>
                  {orders.map((order) => (
                    <div key={order.id} className="grid grid-cols-5 items-center p-4">
                      <div className="font-medium">{order.order_number}</div>
                      <div>{new Date(order.created_at).toLocaleDateString()}</div>
                      <div>Customer</div>
                      <div>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          {order.status}
                        </span>
                      </div>
                      <div className="text-right">${order.total_amount}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
                  <h3 className="mb-2 text-xl font-semibold">No orders yet</h3>
                  <p className="mb-6 text-center text-muted-foreground">
                    When customers place orders, they will appear here.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <StoreSettings store={store} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

