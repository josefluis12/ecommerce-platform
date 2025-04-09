import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNav from "../dashboard-nav"
import { ShoppingCart } from "lucide-react"

export default async function OrdersPage() {
  const supabase = createServerClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth")
  }

  // Get user stores
  const { data: stores } = await supabase.from("stores").select("id, name").eq("owner_id", session.user.id)

  // Get store IDs
  const storeIds = stores?.map((store) => store.id) || []

  // Get orders for user's stores
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      stores (name)
    `)
    .in("store_id", storeIds.length > 0 ? storeIds : ["no-stores"])
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto w-full grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      <aside className="hidden w-[200px] flex-col md:flex lg:w-[250px]">
        <DashboardNav />
      </aside>
      <main className="flex w-full flex-col overflow-hidden">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>View and manage orders from all your stores</CardDescription>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 border-b p-4 font-medium">
                    <div>Order Number</div>
                    <div>Store</div>
                    <div>Date</div>
                    <div>Customer</div>
                    <div>Total</div>
                    <div>Status</div>
                  </div>
                  {orders.map((order) => (
                    <div key={order.id} className="grid grid-cols-6 items-center p-4 border-b last:border-0">
                      <div className="font-medium">{order.order_number}</div>
                      <div>{order.stores?.name}</div>
                      <div>{new Date(order.created_at).toLocaleDateString()}</div>
                      <div>{order.shipping_address ? (order.shipping_address as any).name : "Guest"}</div>
                      <div>${order.total_amount.toFixed(2)}</div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold">No orders yet</h3>
                  <p className="text-muted-foreground">When customers place orders, they will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

