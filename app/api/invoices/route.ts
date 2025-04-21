import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import dayjs from "dayjs"
import { z } from "zod"

// Schema for invoice validation
const invoiceSchema = z.object({
  orderId: z.string(),
  dueDate: z.string().refine((val) => {
    return dayjs(val).isValid() && dayjs(val).isAfter(dayjs())
  }, "Due date must be a valid future date"),
})

// GET all invoices (admin only)
export async function GET(req: Request) {
  try {
    const token = await getToken({ req })

    // Check if user is admin
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ message: "Error fetching invoices" }, { status: 500 })
  }
}

// POST new invoice (admin only)
export async function POST(req: Request) {
  try {
    const token = await getToken({ req })

    // Check if user is admin
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Validate input
    const result = invoiceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ message: "Invalid input", errors: result.error.errors }, { status: 400 })
    }

    const { orderId, dueDate } = result.data

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Check if invoice already exists for this order
    const existingInvoice = await prisma.invoice.findFirst({
      where: { orderId },
    })

    if (existingInvoice) {
      return NextResponse.json({ message: "Invoice already exists for this order" }, { status: 409 })
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        invoiceNumber,
        dueDate: new Date(dueDate),
      },
      include: {
        order: {
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
          },
        },
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ message: "Error creating invoice" }, { status: 500 })
  }
}
