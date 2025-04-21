"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface Order {
  id: string
  status: string
  paidAmount: number
  totalAmount: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    color?: string
    size?: string
    material?: string
    product: {
      id: string
      name: string
      imageUrl: string
    }
  }>
}

export default function OrderDetailPage() {
  const { data: session, status: authStatus } = useSession()
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (authStatus === "authenticated" && params.id) {
      fetchOrder()
    }
  }, [authStatus, params.id, router])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/orders/${params.id}`)

      if (!res.ok) {
        throw new Error("Order not found")
      }

      const data = await res.json()
      setOrder(data)
    } catch (error) {
      console.error("Error fetching order:", error)
      router.push("/orders")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-500"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-500"
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-500"
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-500"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const remainingPayment = order.totalAmount - order.paidAmount

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Order #{order.id.slice(-6)}</h1>
            <p className="text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="font-semibold text-lg mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start border-b pb-4">
                  <div className="h-16 w-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 mr-4 flex-shrink-0">
                    <img
                      src={item.product.imageUrl || "/placeholder.svg"}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span>Qty: {item.quantity}</span>
                      {item.color && <span> | Color: {item.color}</span>}
                      {item.size && <span> | Size: {item.size}</span>}
                      {item.material && <span> | Material: {item.material}</span>}
                    </div>
                    <p className="text-sm font-medium mt-1">Rp {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>Rp {order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>Rp {order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <h3 className="font-medium mb-2">Payment Status</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Paid (50%)</span>
                    <span>Rp {order.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                    <span>Rp {remainingPayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                <strong>Note:</strong> The remaining payment will be collected upon delivery. If you have any questions
                about your order, please contact our customer support.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
