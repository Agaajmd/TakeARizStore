import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@takeariz.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hash(adminPassword, 10)

    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
    })

    console.log(`Admin user created with email: ${adminEmail}`)
  } else {
    console.log("Admin user already exists")
  }

  // Seed some products
  const productsCount = await prisma.product.count()

  if (productsCount === 0) {
    const products = [
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
      },
      // Add more products as needed
    ]

    for (const product of products) {
      await prisma.product.create({
        data: product,
      })
    }

    console.log(`${products.length} products created`)
  } else {
    console.log("Products already exist")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
