import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: any
  store: any
}

export default function ProductCard({ product, store }: ProductCardProps) {
  const productImage =
    product.product_images && product.product_images.length > 0 ? product.product_images[0].url : null

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Link href={`/stores/${store.slug}/products/${product.slug}`}>
        <div className="aspect-square relative bg-slate-100 dark:bg-slate-800">
          {productImage ? (
            <Image src={productImage || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">No Image</span>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/stores/${store.slug}/products/${product.slug}`}>
          <h3 className="font-semibold">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-medium">${product.price.toFixed(2)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">${product.compare_at_price.toFixed(2)}</span>
          )}
        </div>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{product.description}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="secondary">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

