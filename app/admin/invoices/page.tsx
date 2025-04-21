"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, FileText, Printer, Download } from "lucide-react"
import Link from "next/link"

interface InvoiceWithRelations {
  id: string
  orderId: string
  invoiceNumber: string
  createdAt: string
  dueDate: string
  order: {
    userId: string
    status: string
    paidAmount: number
    totalAmount: number
    user: {
      name: string
      email: string
    }
  }
}

export default function AdminInvoices() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/")
    } else if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchInvoices()
    }
  }, [status, session, router])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/invoices")
      const data = await res.json()
      setInvoices(data)
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.order.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          <h1 className="text-3xl font-bold mb-8">Manage Invoices</h1>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by invoice number or customer..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredInvoices.length > 0 ? (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h2 className="font-bold text-lg mb-1">{invoice.invoiceNumber}</h2>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <p className="font-bold">Rp {invoice.order.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Paid: Rp {invoice.order.paidAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          Remaining: Rp {(invoice.order.totalAmount - invoice.order.paidAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-sm mb-1">Customer</h3>
                      <p className="text-sm">{invoice.order.user.name}</p>
                      <p className="text-sm text-gray-500">{invoice.order.user.email}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                      <Button asChild variant="outline">
                        <Link href={`/admin/invoices/${invoice.id}`}>
                          <FileText className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/admin/invoices/${invoice.id}/print`}>
                          <Printer className="mr-2 h-4 w-4" /> Print
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href={`/admin/invoices/${invoice.id}/download`}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No invoices found.</p>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return null
}
