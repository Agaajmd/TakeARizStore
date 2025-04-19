"use client"

import { motion } from "framer-motion"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import CartItem from "@/components/cart-item"
import Link from "next/link"
import { ShoppingBag, ArrowRight } from "lucide-react"

export default function CartPage() {
  const { cart, totalPrice } = useCart()

  // Ensure totalPrice is a valid number
  const safeTotalPrice = typeof totalPrice === "number" && !isNaN(totalPrice) ? totalPrice : 0

  return (
    <main className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Review your selected items before proceeding to checkout.
        </p>
      </motion.div>

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="flex justify-center mb-6">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CartItem item={item} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>Rp {safeTotalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>Rp {safeTotalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <div className="mt-6">
                <Link
                  href="/products"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline flex items-center justify-center"
                >
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </main>
  )
}
