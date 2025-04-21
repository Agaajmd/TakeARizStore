"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, ShoppingBag } from "lucide-react"
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
    product: {
      id: string
      name: string
      imageUrl: string
    }
  }>
}

export default function OrdersPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/orders")
      return
    }

    if (authStatus === "authenticated") {
      fetchOrders()
    }
  }, [authStatus, router])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/orders")

      if (!res.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
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

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You haven&apos;t placed any orders yet. Start shopping to place your first order!
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h2 className="font-bold text-lg mb-1">Order #{order.id.slice(-6)}</h2>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0 flex items-center">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Items</h3>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center">
                              <div className="h-8 w-8 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 mr-2">
                                <img
                                  src={item.product.imageUrl || "/placeholder.svg"}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="text-sm">
                                {item.product.name} x {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Payment</h3>
                        <p className="text-sm">Total: Rp {order.totalAmount.toLocaleString()}</p>
                        <p className="text-sm">Paid: Rp {order.paidAmount.toLocaleString()}</p>
                        <p className="text-sm">
                          Remaining: Rp {(order.totalAmount - order.paidAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button asChild variant="outline">
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  )
}
