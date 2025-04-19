"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Product, CartItem, CustomerInfo } from "@/types/types"

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product & { quantity: number }) => void
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  totalPrice: number
  customerInfo: CustomerInfo | null
  setCustomerInfo: (info: CustomerInfo) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)

  const addToCart = (product: Product & { quantity: number }) => {
    // Ensure price and quantity are valid numbers
    const safeProduct = {
      ...product,
      price: typeof product.price === "number" && !isNaN(product.price) ? product.price : 0,
      quantity: typeof product.quantity === "number" && !isNaN(product.quantity) ? product.quantity : 1,
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === safeProduct.id)

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === safeProduct.id
            ? {
                ...item,
                quantity:
                  (typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 0) +
                  (typeof safeProduct.quantity === "number" && !isNaN(safeProduct.quantity) ? safeProduct.quantity : 1),
              }
            : item,
        )
      }

      return [...prevCart, safeProduct as CartItem]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    // Ensure quantity is a valid number
    const safeQuantity = typeof quantity === "number" && !isNaN(quantity) ? quantity : 1

    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity: safeQuantity } : item)))
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setCustomerInfo(null)
  }

  // Calculate total price with thorough validation
  const totalPrice = cart.reduce((total, item) => {
    // Ensure price and quantity are valid numbers
    const itemPrice = typeof item.price === "number" && !isNaN(item.price) ? item.price : 0
    const itemQuantity = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 0

    // Calculate subtotal and add to running total
    const subtotal = itemPrice * itemQuantity
    return total + (isNaN(subtotal) ? 0 : subtotal)
  }, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalPrice,
        customerInfo,
        setCustomerInfo,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
