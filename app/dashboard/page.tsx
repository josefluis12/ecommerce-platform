import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import DashboardNav from "./dashboard-nav"
import { BarChart3, DollarSign, Package, ShoppingCart, Store, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get user stores
  const { data: stores } = await supabase.from("stores").select("*").eq("owner_id", session.user.id)

  // Get store IDs
  const storeIds = stores?.map((store) => store.id) || []

  // Get total products
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .in("store_id", storeIds.length > 0 ? storeIds : ["no-stores"])

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      *,
      stores (name)
    `)
    .in("store_id", storeIds.length > 0 ? storeIds : ["no-stores"])
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate total revenue
  const { data: orders } = await supabase
    .from("orders")
    .select("total_amount")
    .in("store_id", storeIds.length > 0 ? storeIds : ["no-stores"])
    .eq("status", "paid")

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  return (
    <div className="container mx-auto w-full grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      <aside className="hidden w-[200px] flex-col md:flex lg:w-[250px]">
        <DashboardNav />
      </aside>
      <main className="flex w-full flex-col overflow-hidden">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center gap-2">
              <Button asChild>
                <Link href="/stores/create">
                  <Store className="mr-2 h-4 w-4" />
                  Create Store
                </Link>
              </Button>
            </div>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">From all your stores</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{recentOrders?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all your stores</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stores?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stores?.length === 0 ? "Create your first store" : ""}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{productsCount || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {productsCount === 0 ? "Add products to your store" : ""}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>Your most recent orders across all stores</CardDescription>
                    </div>
                    {recentOrders && recentOrders.length > 0 && (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/orders">View All</Link>
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {recentOrders && recentOrders.length > 0 ? (
                      <div className="space-y-8">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center">
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.stores?.name} • ${order.total_amount}
                              </p>
                            </div>
                            <div className="ml-auto">
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
                      <p className="text-sm text-muted-foreground">
                        No orders yet. Once you start selling, your recent orders will appear here.
                      </p>
                    )}
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Your Stores</CardTitle>
                      <CardDescription>Manage your online stores</CardDescription>
                    </div>
                    {stores && stores.length > 0 && (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/stores">View All</Link>
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {stores && stores.length > 0 ? (
                      <div className="space-y-8">
                        {stores.map((store) => (
                          <div key={store.id} className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">{store.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {store.active ? "Active" : "Inactive"} • {store.commission_rate}% commission
                              </p>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/dashboard/stores/${store.id}`}>Manage</Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <Store className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">You haven't created any stores yet.</p>
                        <Button asChild size="sm">
                          <Link href="/stores/create">Create Store</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>View your store performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Analytics Coming Soon</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We're working on adding detailed analytics for your stores.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>Generate and download reports</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Reports Coming Soon</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We're working on adding detailed reports for your stores.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

