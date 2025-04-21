"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { ArrowLeft, Download, Printer } from "lucide-react"
import Link from "next/link"
import dayjs from "dayjs"

interface Invoice {
  id: string
  invoiceNumber: string
  createdAt: string
  dueDate: string
  order: {
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
}

export default function InvoiceDetailPage() {
  const { data: session, status: authStatus } = useSession()
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBrowser, setIsBrowser] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set isBrowser to true once component mounts (we're in browser)
    setIsBrowser(true)

    if (authStatus === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/")
      return
    }

    if (authStatus === "authenticated" && session?.user?.role === "ADMIN" && params.id) {
      fetchInvoice()
    }
  }, [authStatus, session, params.id, router])

  const fetchInvoice = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/invoices/${params.id}`)

      if (!res.ok) {
        throw new Error("Invoice not found")
      }

      const data = await res.json()
      setInvoice(data)
    } catch (error) {
      console.error("Error fetching invoice:", error)
      router.push("/admin/invoices")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  const handleDownloadPDF = async () => {
    // Only run in browser environment
    if (typeof window === "undefined" || !invoiceRef.current) return

    try {
      // Dynamically import html2pdf only on client side when needed
      const html2pdfModule = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default || html2pdfModule

      const opt = {
        margin: 10,
        filename: `${invoice?.invoiceNumber || "Invoice"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      html2pdf().set(opt).from(invoiceRef.current).save()
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  const remainingPayment = invoice.order.totalAmount - invoice.order.paidAmount

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="print:hidden mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <h1 className="text-3xl font-bold">Invoice</h1>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Button variant="outline" onClick={handlePrint} className="flex-1 sm:flex-auto">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={handleDownloadPDF} className="flex-1 sm:flex-auto">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white text-black dark:bg-gray-800 dark:text-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto print:shadow-none print:dark:bg-white print:dark:text-black"
        ref={invoiceRef}
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-10">
          <div>
            <div className="h-16 w-32 mb-4">
              <img src="/images/logo.png" alt="Take A Riz Logo" className="h-full w-auto object-contain" />
            </div>
            <h2 className="text-2xl font-bold">Take A Riz</h2>
            <p className="text-base text-gray-600 dark:text-gray-300 print:text-gray-600">Premium Bag Store</p>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <h2 className="text-2xl font-bold">INVOICE</h2>
            <p className="text-base text-gray-600 dark:text-gray-300 print:text-gray-600 mt-1">
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-lg font-semibold mb-3">Invoice To:</h3>
            <p className="font-medium">{invoice.order.user.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">{invoice.order.user.email}</p>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Invoice Date:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">
                  {dayjs(invoice.createdAt).format("DD/MM/YYYY")}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Due Date:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">
                  {dayjs(invoice.dueDate).format("DD/MM/YYYY")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 print:border-gray-200">
                <th className="text-left py-3 text-sm">Item</th>
                <th className="text-center py-3 text-sm">Quantity</th>
                <th className="text-right py-3 text-sm">Price</th>
                <th className="text-right py-3 text-sm">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.order.items.map((item) => {
                const subtotal = item.price * item.quantity

                return (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 print:border-gray-200">
                    <td className="py-3">
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.color && <span>Color: {item.color} | </span>}
                        {item.size && <span>Size: {item.size} | </span>}
                        {item.material && <span>Material: {item.material}</span>}
                      </div>
                    </td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">Rp {item.price.toLocaleString()}</td>
                    <td className="py-3 text-right">Rp {subtotal.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Total */}
        <div className="flex justify-end mb-10">
          <div className="w-full sm:w-1/2">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal:</span>
              <span>Rp {invoice.order.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Shipping:</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 print:border-gray-200">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-lg font-bold">Rp {invoice.order.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600 dark:text-gray-300 print:text-gray-600">Paid Amount (50%):</span>
              <span>Rp {invoice.order.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300 print:text-gray-600">Remaining Payment:</span>
              <span>Rp {remainingPayment.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Note */}
        <div className="border-t border-gray-200 dark:border-gray-700 print:border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-3">Note:</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 print:text-gray-600 mb-4">
            If payment is made through electronic transactions, must provide proof of transfer.
          </p>
          <div className="mb-6">
            <h4 className="font-medium text-sm mb-2">Bank Account:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">BRI: 8776234423</p>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 print:text-gray-600">Thank you for your business!</p>
        </div>
      </motion.div>
    </div>
  )
}
