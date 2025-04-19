"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only show the UI once mounted on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="container mx-auto p-8">Loading theme information...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Theme Debug Page</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Theme Settings</h2>
        <div className="space-y-2">
          <p>
            <strong>Current theme:</strong> {theme}
          </p>
          <p>
            <strong>Resolved theme:</strong> {resolvedTheme}
          </p>
          <p>
            <strong>System theme:</strong> {systemTheme}
          </p>
          <p>
            <strong>Is dark mode:</strong> {resolvedTheme === "dark" ? "Yes" : "No"}
          </p>
          <p>
            <strong>HTML class:</strong> {document.documentElement.classList.contains("dark") ? "dark" : "light"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Theme Controls</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setTheme("light")}>Set Light Theme</Button>
          <Button onClick={() => setTheme("dark")}>Set Dark Theme</Button>
          <Button
            onClick={() => {
              const newTheme = resolvedTheme === "dark" ? "light" : "dark"
              setTheme(newTheme)
            }}
          >
            Toggle Theme
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Theme Test Elements</h2>
        <div className="space-y-4">
          <div className="p-4 bg-background text-foreground border border-border rounded">
            Background and text colors from theme
          </div>
          <div className="p-4 bg-card text-card-foreground border border-border rounded">
            Card background and text from theme
          </div>
          <div className="p-4 bg-primary text-primary-foreground rounded">Primary button colors</div>
          <div className="p-4 bg-secondary text-secondary-foreground rounded">Secondary button colors</div>
        </div>
      </div>
    </div>
  )
}
