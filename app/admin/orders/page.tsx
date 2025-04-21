"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText, Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface OrderWithRelations {
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
    productId: string
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
  invoice?: {
    id: string
    invoiceNumber: string
  }
}

export default function AdminOrders() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/")
    } else if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchOrders()
    }
  }, [status, session, router])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/orders")
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter ? order.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (status === "authenticated" && session?.user?.role === "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by customer name, email or order ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-sm mb-1">Customer</h3>
                        <p className="text-sm">{order.user.name}</p>
                        <p className="text-sm text-gray-500">{order.user.email}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">Payment</h3>
                        <p className="text-sm">Paid: Rp {order.paidAmount.toLocaleString()}</p>
                        <p className="text-sm">Total: Rp {order.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">Items</h3>
                        <p className="text-sm">{order.items.length} items</p>
                        <p className="text-sm text-gray-500">
                          {order.items.map((item) => item.product.name).join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                      <Button asChild variant="outline">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </Button>
                      {!order.invoice && (
                        <Button asChild>
                          <Link href={`/admin/invoices/new?orderId=${order.id}`}>
                            <FileText className="mr-2 h-4 w-4" /> Generate Invoice
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found.</p>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return null
}
