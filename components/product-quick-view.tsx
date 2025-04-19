"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Minus, Plus } from "lucide-react"
import type { Product } from "@/types/types"
import { useState } from "react"
import { useCart } from "@/context/cart-context"

interface ProductQuickViewProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export default function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  // Ensure price is a valid number
  const price = typeof product.price === "number" && !isNaN(product.price) ? product.price : 0

  const handleAddToCart = () => {
    addToCart({ ...product, quantity })
    onClose()
  }

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Quick view of the product details</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="aspect-square overflow-hidden rounded-md">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-xl mb-2">{product.name}</h3>
            <p className="text-xl font-semibold mb-4">Rp {price.toLocaleString()}</p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{product.description}</p>

            <div className="flex items-center mb-6">
              <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 font-medium">{quantity}</span>
              <Button variant="outline" size="icon" onClick={increaseQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleAddToCart} className="w-full">
              <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
