import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { z } from "zod"

// Schema for product validation
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  imageUrl: z.string().url("Image URL must be valid"),
  stock: z.number().int().nonnegative("Stock must be non-negative"),
  colors: z.array(z.string()),
  sizes: z.array(z.string()),
  materials: z.array(z.string()),
  discount: z.number().min(0).max(100).optional(),
})

// GET all products
export async function GET(req: Request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Error fetching products" }, { status: 500 })
  }
}

// POST new product (admin only)
export async function POST(req: Request) {
  try {
    const token = await getToken({ req })

    // Check if user is admin
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const result = productSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: result.data,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Error creating product" }, { status: 500 })
  }
}
