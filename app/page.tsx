"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, ShoppingBag, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeaturedProducts from "@/components/featured-products"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 dark:from-black/80 dark:to-black/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1974&auto=format&fit=crop')",
          }}
        />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Elevate Your Style with Take A Riz</h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Discover our premium collection of bags designed for the modern lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                <Link href="/products">
                  Shop Collection <ShoppingBag className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10"
              >
                <Link href="#featured">
                  Explore Featured <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore our most popular bags, crafted with premium materials and designed for everyday elegance.
            </p>
          </motion.div>

          <FeaturedProducts />

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/products">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between"
          >
            <div className="mb-8 md:mb-0 md:mr-8 max-w-xl">
              <h2 className="text-3xl font-bold mb-4">Join Into Our Community</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Connect with other Take A Riz enthusiasts, get exclusive offers, and stay updated on new arrivals.
              </p>
              <Button asChild className="flex items-center">
                <a href="https://chat.whatsapp.com/example" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> Join WhatsApp Group
                </a>
              </Button>
            </div>
            <div className="w-full md:w-1/3 aspect-square rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1974&auto=format&fit=crop"
                alt="Community"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
