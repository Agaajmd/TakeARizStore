import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { z } from "zod"

// Schema for order validation
const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
})

const orderSchema = z.object({
  items: z.array(orderItemSchema),
  paidAmount: z.number().positive(),
  totalAmount: z.number().positive(),
})

// GET all orders (admin gets all, user gets their own)
export async function GET(req: Request) {
  try {
    const token = await getToken({ req })

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Admin can see all orders, users can only see their own
    const orders =
      token.role === "ADMIN"
        ? await prisma.order.findMany({
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              items: {
                include: {
                  product: true,
                },
              },
              invoice: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          })
        : await prisma.order.findMany({
            where: {
              userId: token.id,
            },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ message: "Error fetching orders" }, { status: 500 })
  }
}

// POST new order
export async function POST(req: Request) {
  try {
    const token = await getToken({ req })

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const result = orderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { items, paidAmount, totalAmount } = result.data

    // Verify products exist and calculate correct total
    const calculatedTotal = 0
    const productIds = items.map((item) => item.productId)

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ message: "One or more products not found" }, { status: 400 })
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: token.id,
        paidAmount,
        totalAmount,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!
            const price = product.discount ? product.price * (1 - product.discount / 100) : product.price

            return {
              productId: item.productId,
              quantity: item.quantity,
              price,
              color: item.color,
              size: item.size,
              material: item.material,
            }
          }),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ message: "Error creating order" }, { status: 500 })
  }
}
