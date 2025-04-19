"use client"

import { motion } from "framer-motion"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { Download, Printer } from "lucide-react"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"

export default function InvoicePage() {
  const { cart, totalPrice, customerInfo, clearCart } = useCart()
  const router = useRouter()
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [isBrowser, setIsBrowser] = useState(false)

  const currentDate = dayjs()
  const dueDate = currentDate.add(3, "day")

  // Ensure totalPrice is a valid number
  const safeTotalPrice = typeof totalPrice === "number" && !isNaN(totalPrice) ? totalPrice : 0

  useEffect(() => {
    // Set isBrowser to true once component mounts (we're in browser)
    setIsBrowser(true)

    if (cart.length === 0 && !customerInfo) {
      router.push("/products")
    }
  }, [cart.length, customerInfo, router])

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
        filename: `TakeARiz-Invoice-${currentDate.format("YYYYMMDD")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      html2pdf().set(opt).from(invoiceRef.current).save()
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  // Don't render anything during SSR for this client component
  if (!isBrowser) {
    return null
  }

  if (cart.length === 0 && !customerInfo) {
    return null // Will redirect in useEffect
  }

  return (
    <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <h1 className="text-2xl sm:text-3xl font-bold">Invoice</h1>
        <div className="flex space-x-3 print:hidden w-full sm:w-auto justify-center">
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
        className="bg-white text-black dark:bg-gray-800 dark:text-white rounded-lg shadow-lg p-4 sm:p-8 max-w-4xl mx-auto print:shadow-none print:dark:bg-white print:dark:text-black"
        ref={invoiceRef}
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-10">
          <div>
            <div className="h-16 w-32 mb-3 sm:mb-4">
              <img src="/images/logo.png" alt="Take A Riz Logo" className="h-full w-auto object-contain" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Take A Riz</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 print:text-gray-600">
              Premium Bag Store
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-right w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl font-bold">INVOICE</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 print:text-gray-600 mt-1">
              #
              {Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, "0")}
            </p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-10">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Invoice To:</h3>
            <p className="font-medium text-sm sm:text-base">{customerInfo?.name}</p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">
              {customerInfo?.email}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">
              {customerInfo?.address}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">
              {customerInfo?.phone}
            </p>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Invoice Date:</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">
                  {currentDate.format("DD/MM/YYYY")}
                </p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Due Date:</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">
                  {dueDate.format("DD/MM/YYYY")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items - Mobile View */}
        <div className="mb-6 sm:hidden">
          {cart.map((item) => {
            // Ensure price and quantity are valid numbers
            const price = typeof item.price === "number" && !isNaN(item.price) ? item.price : 0
            const quantity = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 1

            // Calculate subtotal with validation
            const subtotal = price * quantity
            const safeSubtotal = isNaN(subtotal) ? 0 : subtotal

            return (
              <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 print:border-gray-200 py-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-right text-xs">
                    <div>Rp {safeSubtotal.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 print:text-gray-600">
                  <span>
                    {quantity} x Rp {price.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Invoice Items - Desktop View */}
        <div className="mb-6 sm:mb-10 hidden sm:block">
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
              {cart.map((item) => {
                // Ensure price and quantity are valid numbers
                const price = typeof item.price === "number" && !isNaN(item.price) ? item.price : 0
                const quantity = typeof item.quantity === "number" && !isNaN(item.quantity) ? item.quantity : 1

                // Calculate subtotal with validation
                const subtotal = price * quantity
                const safeSubtotal = isNaN(subtotal) ? 0 : subtotal

                return (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 print:border-gray-200">
                    <td className="py-3">
                      <div className="font-medium text-sm">{item.name}</div>
                    </td>
                    <td className="py-3 text-center text-sm">{quantity}</td>
                    <td className="py-3 text-right text-sm">Rp {price.toLocaleString()}</td>
                    <td className="py-3 text-right text-sm">Rp {safeSubtotal.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Total */}
        <div className="flex justify-end mb-6 sm:mb-10">
          <div className="w-full sm:w-1/2">
            <div className="flex justify-between mb-2 text-sm">
              <span className="font-medium">Subtotal:</span>
              <span>Rp {safeTotalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="font-medium">Shipping:</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 print:border-gray-200">
              <span className="text-base sm:text-lg font-bold">Grand Total:</span>
              <span className="text-base sm:text-lg font-bold">Rp {safeTotalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Note */}
        <div className="border-t border-gray-200 dark:border-gray-700 print:border-gray-200 pt-4 sm:pt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Note:</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 print:text-gray-600 mb-3 sm:mb-4">
            If payment is made through electronic transactions, must provide proof of transfer.
          </p>
          <div className="mb-4 sm:mb-6">
            <h4 className="font-medium text-sm mb-1 sm:mb-2">Bank Account:</h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 print:text-gray-600">BRI: 8776234423</p>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 print:text-gray-600">Thank you for your business!</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 sm:mt-8 text-center print:hidden"
      >
        <Button
          onClick={() => {
            clearCart()
            router.push("/")
          }}
          variant="outline"
          className="mx-auto"
        >
          Return to Home
        </Button>
      </motion.div>
    </main>
  )
}
