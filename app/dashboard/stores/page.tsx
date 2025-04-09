import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Store } from "lucide-react"
import DashboardNav from "../dashboard-nav"

export default async function StoresPage() {
  const supabase = createServerClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth")
  }

  // Get user stores
  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", session.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto w-full grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      <aside className="hidden w-[200px] flex-col md:flex lg:w-[250px]">
        <DashboardNav />
      </aside>
      <main className="flex w-full flex-col overflow-hidden">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Your Stores</h2>
            <Button asChild>
              <Link href="/stores/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Store
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stores && stores.length > 0 ? (
              stores.map((store) => (
                <Card key={store.id} className="overflow-hidden">
                  <CardHeader className="border-b bg-muted/50 p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Store className="h-5 w-5" />
                      {store.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`h-2 w-2 rounded-full ${store.active ? "bg-green-500" : "bg-red-500"}`}></span>
                      <span>{store.active ? "Active" : "Inactive"}</span>
                    </div>
                    {store.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
                    )}
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Commission Rate: {store.commission_rate}%</p>
                      <p>Created: {new Date(store.created_at).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 p-4">
                    <div className="flex w-full gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/stores/${store.slug}`} target="_blank">
                          View Store
                        </Link>
                      </Button>
                      <Button asChild className="flex-1">
                        <Link href={`/dashboard/stores/${store.id}`}>Manage</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                <Store className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">No stores yet</h3>
                <p className="mb-6 text-muted-foreground">Create your first store to start selling products.</p>
                <Button asChild>
                  <Link href="/stores/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Store
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

