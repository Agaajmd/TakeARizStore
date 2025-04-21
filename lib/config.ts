// Environment variables configuration

// Server-side only environment variables
export const serverConfig = {
  database: {
    url: process.env.DATABASE_URL || "",
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET || "",
    adminEmail: process.env.ADMIN_EMAIL || "admin@takeariz.com",
    adminPassword: process.env.ADMIN_PASSWORD || "",
  },
  api: {
    key: process.env.API_KEY || "",
  },
}

// Client-side safe environment variables (must be prefixed with NEXT_PUBLIC_)
export const clientConfig = {
  // Add any NEXT_PUBLIC_ variables here
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
}
