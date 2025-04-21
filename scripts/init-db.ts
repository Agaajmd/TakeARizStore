import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  try {
    // Create admin user if it doesn't exist
    const adminExists = await prisma.user.findUnique({
      where: { email: "admin@takeariz.com" },
    })

    if (!adminExists) {
      const hashedPassword = await hash("admin123", 10)
      await prisma.user.create({
        data: {
          id: `admin-${Date.now()}`,
          name: "Admin User",
          email: "admin@takeariz.com",
          passwordHash: hashedPassword,
          role: "ADMIN",
        },
      })
      console.log("Admin user created")
    } else {
      console.log("Admin user already exists")
    }

    // Add sample products if none exist
    const productsCount = await prisma.product.count()

    if (productsCount === 0) {
      await prisma.product.createMany({
        data: [
          {
            name: "Urban Backpack",
            description:
              "A versatile backpack perfect for daily commutes and weekend adventures. Features multiple compartments and padded laptop sleeve.",
            price: 350000,
            imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=1974&auto=format&fit=crop",
            stock: 15,
            colors: ["Black", "Navy", "Gray"],
            sizes: ["Small", "Medium", "Large"],
            materials: ["Nylon", "Canvas", "Leather Trim"],
          },
          {
            name: "Vintage Leather Satchel",
            description:
              "Handcrafted from premium leather, this satchel combines classic style with modern functionality. Perfect for work or casual outings.",
            price: 420000,
            imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1976&auto=format&fit=crop",
            stock: 10,
            colors: ["Brown", "Black", "Tan"],
            sizes: ["Standard"],
            materials: ["Full Grain Leather", "Vegetable Tanned Leather"],
            discount: 10.0,
          },
          {
            name: "Canvas Tote Bag",
            description:
              "A spacious and durable tote bag made from heavy-duty canvas. Ideal for shopping, beach trips, or as an everyday carry-all.",
            price: 150000,
            imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1974&auto=format&fit=crop",
            stock: 25,
            colors: ["Natural", "Black", "Navy", "Green"],
            sizes: ["Standard"],
            materials: ["Canvas", "Cotton"],
          },
          {
            name: "Classic Laptop Bag",
            description:
              "Designed to protect your laptop in style. Features padded compartments, water-resistant exterior, and comfortable shoulder strap.",
            price: 480000,
            imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1974&auto=format&fit=crop",
            stock: 8,
            colors: ["Black", "Brown", "Gray"],
            sizes: ['13"', '15"', '17"'],
            materials: ["Leather", "Nylon", "Polyester"],
            discount: 15.0,
          },
          {
            name: "Everyday Sling Bag",
            description:
              "A compact sling bag that's perfect for essentials. Ergonomic design with adjustable strap and quick-access pockets.",
            price: 275000,
            imageUrl: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1970&auto=format&fit=crop",
            stock: 20,
            colors: ["Black", "Gray", "Blue", "Red"],
            sizes: ["Small", "Medium"],
            materials: ["Nylon", "Polyester"],
          },
        ],
      })
      console.log("Sample products created")
    } else {
      console.log("Products already exist")
    }

    console.log("Database initialization completed")
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
