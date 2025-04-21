"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Home } from "lucide-react"
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

export default function OrderConfirmationPage() {
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
      >
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Thank you for your order. We&apos;ve received your payment.
        </p>

        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Order Number:</span>
            <span>#{order.id.slice(-6)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Date:</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Status:</span>
            <span className="capitalize">{order.status.toLowerCase()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Paid Amount:</span>
            <span>Rp {order.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Remaining Payment:</span>
            <span>Rp {remainingPayment.toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start">
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
                </div>
                <div className="text-right">
                  <span className="font-medium">Rp {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            <strong>Note:</strong> You have paid 50% of the total amount. The remaining balance will be due upon
            delivery. Please keep your order number for reference.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/orders">
              <ArrowRight className="mr-2 h-4 w-4" /> View My Orders
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </main>
  )
}
