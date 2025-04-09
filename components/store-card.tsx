import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StoreCardProps {
  store: any
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={`/stores/${store.slug}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-video relative bg-slate-100 dark:bg-slate-800">
          {store.banner_url ? (
            <Image src={store.banner_url || "/placeholder.svg"} alt={store.name} fill className="object-cover" />
          ) : store.logo_url ? (
            <div className="flex h-full items-center justify-center">
              <Image
                src={store.logo_url || "/placeholder.svg"}
                alt={store.name}
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl font-bold text-slate-300 dark:text-slate-600">{store.name.charAt(0)}</span>
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
  )
}

