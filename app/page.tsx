import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase-server"
import FeaturedStores from "@/components/featured-stores"
import HowItWorks from "@/components/how-it-works"

export default async function Home() {
  const supabase = createServerClient()

  // Fetch featured stores
  const { data: featuredStores } = await supabase
    .from("stores")
    .select("id, name, slug, description, logo_url")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(6)

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 dark:from-slate-900 dark:to-slate-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                  Launch Your Online Store Today
                </h1>
                <p className="max-w-[600px] text-slate-500 dark:text-slate-400 md:text-xl">
                  Create your own online store in minutes. Sell your products to customers worldwide and grow your
                  business.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/stores/create">
                  <Button
                    size="lg"
                    className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    Create Your Store
                  </Button>
                </Link>
                <Link href="/stores">
                  <Button size="lg" variant="outline">
                    Browse Stores
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                alt="Hero Image"
                className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                height="500"
                src="/placeholder.svg?height=500&width=800"
                width="800"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Featured Stores */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tighter">Featured Stores</h2>
          <p className="text-slate-500 dark:text-slate-400 md:text-lg">
            Discover unique products from our featured store owners
          </p>
          <FeaturedStores stores={featuredStores || []} />
        </div>
      </section>
    </div>
  )
}

