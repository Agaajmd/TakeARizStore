"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import dayjs from "dayjs"

interface Order {
  id: string
  userId: string
  status: string
  paidAmount: number
  totalAmount: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
    }
  }>
}

export default function NewInvoicePage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<Order | null>(null)
  const [dueDate, setDueDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/")
      return
    }

    if (authStatus === "authenticated" && orderId) {
      fetchOrder()
    } else if (authStatus === "authenticated" && !orderId) {
      router.push("/admin/orders")
    }
  }, [authStatus, session, orderId, router])

  useEffect(() => {
    // Set default due date to 7 days from now
    const defaultDueDate = dayjs().add(7, "day").format("YYYY-MM-DD")
    setDueDate(defaultDueDate)
  }, [])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/orders/${orderId}`)

      if (!res.ok) {
        throw new Error("Order not found")
      }

      const data = await res.json()
      setOrder(data)
    } catch (error) {
      console.error("Error fetching order:", error)
      router.push("/admin/orders")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!order) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          dueDate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create invoice")
      }

      const invoice = await response.json()
      router.push(`/admin/invoices/${invoice.id}`)
    } catch (error) {
      console.error("Invoice creation error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during invoice creation")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-8">Generate Invoice</h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Invoice Details</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input id="orderId" value={order.id} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderDate">Order Date</Label>
                    <Input id="orderDate" value={new Date(order.createdAt).toLocaleDateString()} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" value={order.user.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Customer Email</Label>
                    <Input id="customerEmail" value={order.user.email} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Total Amount</Label>
                    <Input id="totalAmount" value={`Rp ${order.totalAmount.toLocaleString()}`} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paidAmount">Paid Amount</Label>
                    <Input id="paidAmount" value={`Rp ${order.paidAmount.toLocaleString()}`} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  <FileText className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Generating Invoice..." : "Generate Invoice"}
                </Button>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">Items</h3>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.product.name} x {item.quantity}
                        </span>
                        <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>Rp {order.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500 dark:text-gray-400">Paid (50%)</span>
                    <span>Rp {order.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Remaining</span>
                    <span>Rp {(order.totalAmount - order.paidAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
