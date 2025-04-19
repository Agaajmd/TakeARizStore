"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingBag, Eye } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useState } from "react"
import type { Product } from "@/types/product"
import ProductQuickView from "@/components/product-quick-view"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

  // Ensure price is a valid number
  const price = typeof product.price === "number" && !isNaN(product.price) ? product.price : 0

  return (
    <>
      <Card className="overflow-hidden group">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => setIsQuickViewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Quick view</span>
          </Button>
        </div>
        <CardContent className="pt-4">
          <h3 className="font-medium text-lg mb-1">{product.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Rp {price.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">{product.description}</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => addToCart({ ...product, quantity: 1 })}>
            <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </CardFooter>
      </Card>

      <ProductQuickView product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
    </>
  )
}
