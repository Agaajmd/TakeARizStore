"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { cart, totalPrice, setCustomerInfo } = useCart()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  })

  // Ensure totalPrice is a valid number
  const safeTotalPrice = typeof totalPrice === "number" && !isNaN(totalPrice) ? totalPrice : 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCustomerInfo(formData)
    router.push("/invoice")
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

              <Button type="submit" className="w-full" size="lg">
                Complete Order
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
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.name} x {quantity}
                    </span>
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
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
