"use client"

import { motion } from "framer-motion"
import { products } from "@/data/products"
import ProductCard from "@/components/product-card"

export default function FeaturedProducts() {
  // Get 4 featured products
  const featuredProducts = products.slice(0, 4)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredProducts.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  )
}
