"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { ShoppingBag, Minus, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  stock: number
  colors: string[]
  sizes: string[]
  materials: string[]
  discount?: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedMaterial, setSelectedMaterial] = useState<string>("")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/products/${params.id}`)

        if (!res.ok) {
          throw new Error("Product not found")
        }

        const data = await res.json()
        setProduct(data)

        // Set default selections
        if (data.colors.length > 0) setSelectedColor(data.colors[0])
        if (data.sizes.length > 0) setSelectedSize(data.sizes[0])
        if (data.materials.length > 0) setSelectedMaterial(data.materials[0])
      } catch (error) {
        console.error("Error fetching product:", error)
        router.push("/products")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  const handleAddToCart = () => {
    if (!product) return

    // Calculate price with discount if applicable
    const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price

    addToCart({
      ...product,
      price: finalPrice,
      quantity,
      color: selectedColor,
      size: selectedSize,
      material: selectedMaterial,
    })

    router.push("/cart")
  }

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>
    )
  }

  // Calculate price with discount if applicable
  const originalPrice = product.price
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : null

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <img src={product.imageUrl || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="mb-4">
            {discountedPrice ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold">Rp {discountedPrice.toLocaleString()}</span>
                <span className="ml-2 text-lg text-gray-500 line-through">Rp {originalPrice.toLocaleString()}</span>
                <span className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs font-semibold px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold">Rp {originalPrice.toLocaleString()}</span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Material Selection */}
            {product.materials.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Material</label>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a material" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.materials.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center">
                <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-medium">{quantity}</span>
                <Button variant="outline" size="icon" onClick={increaseQuantity} disabled={product.stock <= quantity}>
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="ml-4 text-sm text-gray-500">{product.stock} available</span>
              </div>
            </div>
          </div>

          <Button onClick={handleAddToCart} className="w-full" size="lg" disabled={product.stock === 0}>
            <ShoppingBag className="mr-2 h-5 w-5" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>

          <div className="mt-8">
            <Tabs defaultValue="description">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">
                  Description
                </TabsTrigger>
                <TabsTrigger value="details" className="flex-1">
                  Details
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
              </TabsContent>
              <TabsContent value="details" className="mt-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Stock:</span> {product.stock} units
                  </p>
                  {product.colors.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Available Colors:</span> {product.colors.join(", ")}
                    </p>
                  )}
                  {product.sizes.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Available Sizes:</span> {product.sizes.join(", ")}
                    </p>
                  )}
                  {product.materials.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Available Materials:</span> {product.materials.join(", ")}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
