import Link from "next/link"
import { createServerClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import StoreCard from "@/components/store-card"

export default async function StoresPage() {
  const supabase = createServerClient()

  // Fetch active stores
  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stores</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Browse all stores on our platform</p>
        </div>
        <Button asChild>
          <Link href="/stores/create">Create Your Store</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stores && stores.length > 0 ? (
          stores.map((store) => <StoreCard key={store.id} store={store} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <h3 className="mb-2 text-xl font-semibold">No stores yet</h3>
            <p className="mb-6 text-muted-foreground">Be the first to create a store on our platform!</p>
            <Button asChild>
              <Link href="/stores/create">Create Your Store</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

