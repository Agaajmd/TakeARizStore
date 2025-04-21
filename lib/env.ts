export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
  NEXTAUTH_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  API_KEY: process.env.API_KEY || "",
}

// Validate required environment variables
export function validateEnv() {
  const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET"]

  const missingEnvVars = requiredEnvVars.filter((key) => !env[key as keyof typeof env])

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`)
  }

  return true
}
