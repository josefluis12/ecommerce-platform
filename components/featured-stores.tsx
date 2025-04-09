import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Store {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
}

export default function FeaturedStores({ stores }: { stores: Store[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stores.length > 0 ? (
        stores.map((store) => (
          <Link key={store.id} href={`/stores/${store.slug}`}>
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-video relative bg-slate-100 dark:bg-slate-800">
                {store.logo_url ? (
                  <Image src={store.logo_url || "/placeholder.svg"} alt={store.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">
                      {store.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">{store.name}</h3>
                {store.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{store.description}</p>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Badge variant="secondary">Visit Store</Badge>
              </CardFooter>
            </Card>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center">
          <p className="text-slate-500 dark:text-slate-400">No featured stores yet. Be the first to create one!</p>
        </div>
      )}
    </div>
  )
}

