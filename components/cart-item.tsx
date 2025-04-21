"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import type { CartItem as CartItemType } from "@/types/types"

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()

  // Ensure price and quantity are valid numbers
  const price = typeof item.price === "number" && !isNaN(item.price) ? item.price : 0
  const quantity = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 1

  // Calculate subtotal with validation
  const subtotal = price * quantity
  const safeSubtotal = isNaN(subtotal) ? 0 : subtotal

  const handleIncrease = () => {
    updateQuantity(item.id, quantity + 1)
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(item.id, quantity - 1)
    }
  }

  const handleRemove = () => {
    removeFromCart(item.id)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="w-full sm:w-24 h-24 rounded-md overflow-hidden mb-4 sm:mb-0 sm:mr-4">
        <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-grow">
        <h3 className="font-medium text-lg">{item.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Rp {price.toLocaleString()}</p>
        {/* Add customization options display */}
        {(item.color || item.size || item.material) && (
          <div className="text-xs text-gray-500 mb-2">
            {item.color && <span className="mr-2">Color: {item.color}</span>}
            {item.size && <span className="mr-2">Size: {item.size}</span>}
            {item.material && <span>Material: {item.material}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center mt-4 sm:mt-0">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDecrease} disabled={quantity <= 1}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="mx-3 font-medium">{quantity}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleIncrease}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 sm:ml-6">
        <span className="font-medium sm:ml-6">Rp {safeSubtotal.toLocaleString()}</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 ml-4"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
    </div>
  )
}
