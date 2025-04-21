"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { LayoutDashboard, Package, ShoppingBag, FileText, LogOut, ChevronRight } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session || session.user.role !== "ADMIN") {
    return <div className="container mx-auto px-4 py-8">Unauthorized</div>
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      name: "Invoices",
      href: "/admin/invoices",
      icon: FileText,
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <img src="/images/logo.png" alt="Take A Riz Logo" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold">Admin</span>
          </div>
          <div className="flex flex-col flex-grow">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive
                          ? "text-black dark:text-white"
                          : "text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white"
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/api/auth/signout"
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white" />
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <img src="/images/logo.png" alt="Take A Riz Logo" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold">Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/api/auth/signout"
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="px-4 py-2 overflow-x-auto flex space-x-4 border-t border-gray-200 dark:border-gray-700">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center py-1 ${
                  isActive
                    ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                <item.icon className="h-4 w-4 mr-1" />
                <span className="text-sm">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 sm:px-6 md:px-8">
              {/* Breadcrumbs */}
              <nav className="hidden sm:flex mb-4" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <li>
                    <Link href="/admin/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300">
                      Admin
                    </Link>
                  </li>
                  {pathname
                    .split("/")
                    .filter((segment) => segment && segment !== "admin")
                    .map((segment, index, segments) => {
                      const href = `/admin/${segments.slice(0, index + 1).join("/")}`
                      const isLast = index === segments.length - 1
                      return (
                        <li key={segment} className="flex items-center">
                          <ChevronRight className="h-4 w-4 mx-1" />
                          {isLast ? (
                            <span className="font-medium text-gray-900 dark:text-white capitalize">{segment}</span>
                          ) : (
                            <Link href={href} className="hover:text-gray-700 dark:hover:text-gray-300 capitalize">
                              {segment}
                            </Link>
                          )}
                        </li>
                      )
                    })}
                </ol>
              </nav>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
