import { serverConfig } from "./config"

/**
 * Utility function to make authenticated API requests
 */
export async function fetchWithApiKey(url: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${serverConfig.api.key}`,
    "Content-Type": "application/json",
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
