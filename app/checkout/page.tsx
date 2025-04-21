"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { ShoppingBag, CreditCard } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const { cart, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Ensure totalPrice is a valid number
  const safeTotalPrice = typeof totalPrice === "number" && !isNaN(totalPrice) ? totalPrice : 0

  // Calculate 50% upfront payment
  const upfrontPayment = safeTotalPrice * 0.5

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (status !== "authenticated") {
      router.push("/auth/login?callbackUrl=/checkout")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Prepare order items with customization options
      const orderItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        material: item.material,
      }))

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderItems,
          paidAmount: upfrontPayment,
          totalAmount: safeTotalPrice,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create order")
      }

      const order = await response.json()

      // Clear cart and redirect to order confirmation
      clearCart()
      router.push(`/orders/${order.id}/confirmation`)
    } catch (error) {
      console.error("Checkout error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during checkout")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <div className="flex justify-center mb-6">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">You need to add items to your cart before checkout.</p>
          <Button asChild size="lg">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </motion.div>
      </main>
    )
  }

  if (status === "unauthenticated") {
    return (
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <h2 className="text-2xl font-semibold mb-4">Please login to continue</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">You need to be logged in to complete your purchase.</p>
          <Button asChild size="lg">
            <Link href="/auth/login?callbackUrl=/checkout">Login</Link>
          </Button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Complete your order by providing your details below.
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6 max-w-3xl mx-auto">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Shipping Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    <strong>Note:</strong> This is a pre-order. You will pay 50% upfront (Rp{" "}
                    {upfrontPayment.toLocaleString()}) and the remaining balance upon delivery.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md mb-4">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Bank Transfer</span>
                  </div>
                  <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">BRI: 8776234423</span>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Pay Rp ${upfrontPayment.toLocaleString()} Now`}
              </Button>
            </form>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cart.map((item) => {
                // Ensure price and quantity are valid numbers
                const price = typeof item.price === "number" && !isNaN(item.price) ? item.price : 0
                const quantity = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 1

                // Calculate subtotal with validation
                const subtotal = price * quantity
                const safeSubtotal = isNaN(subtotal) ? 0 : subtotal

                return (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.name} x {quantity}
                      </span>
                      {item.color && <span className="block text-xs text-gray-500">Color: {item.color}</span>}
                      {item.size && <span className="block text-xs text-gray-500">Size: {item.size}</span>}
                      {item.material && <span className="block text-xs text-gray-500">Material: {item.material}</span>}
                    </div>
                    <span>Rp {safeSubtotal.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-3">
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
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Upfront Payment (50%)</span>
                  <span className="font-medium">Rp {upfrontPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Remaining Payment</span>
                  <span>Rp {upfrontPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
