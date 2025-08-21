// Cookie-based password storage utilities
export interface StoredPassword {
  id: string
  password: string
  label: string
  strength: number
  length: number
  createdAt: string
  settings: {
    includeUppercase: boolean
    includeLowercase: boolean
    includeNumbers: boolean
    includeSymbols: boolean
    excludeSimilar: boolean
  }
  category?: string
}

export interface ExportOptions {
  format: "json" | "csv" | "txt"
  includePasswords: boolean
  includeMetadata: boolean
  selectedIds?: string[]
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}

// Added category management interfaces
export interface Category {
  id: string
  name: string
  color: string
  icon: string
  createdAt: string
}

export interface CategoryStats {
  [categoryName: string]: {
    total: number
    weak: number
    fair: number
    good: number
    strong: number
  }
}

const STORAGE_KEY = "securepass_passwords"
const CATEGORIES_KEY = "securepass_categories"
const MAX_PASSWORDS = 100 // Limit to prevent cookie size issues

export const DEFAULT_CATEGORIES: Omit<Category, "id" | "createdAt">[] = [
  { name: "Personal", color: "#10b981", icon: "👤" },
  { name: "Work", color: "#3b82f6", icon: "💼" },
  { name: "Social", color: "#8b5cf6", icon: "🌐" },
  { name: "Banking", color: "#f59e0b", icon: "🏦" },
  { name: "Shopping", color: "#ef4444", icon: "🛒" },
  { name: "Entertainment", color: "#ec4899", icon: "🎬" },
]

// Get all stored passwords from cookies
export function getStoredPasswords(): StoredPassword[] {
  if (typeof window === "undefined") return []

  try {
    const cookies = document.cookie.split(";")
    const passwordCookie = cookies.find((cookie) => cookie.trim().startsWith(`${STORAGE_KEY}=`))

    if (!passwordCookie) return []

    const cookieValue = passwordCookie.split("=")[1]
    const decodedValue = decodeURIComponent(cookieValue)
    return JSON.parse(decodedValue)
  } catch (error) {
    console.error("Error reading stored passwords:", error)
    return []
  }
}

// Save passwords to cookies
export function savePasswordsToCookies(passwords: StoredPassword[]): boolean {
  if (typeof window === "undefined") return false

  try {
    // Limit the number of stored passwords
    const limitedPasswords = passwords.slice(0, MAX_PASSWORDS)
    const jsonString = JSON.stringify(limitedPasswords)
    const encodedValue = encodeURIComponent(jsonString)

    // Set cookie with 1 year expiration
    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)

    document.cookie = `${STORAGE_KEY}=${encodedValue}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`
    return true
  } catch (error) {
    console.error("Error saving passwords:", error)
    return false
  }
}

// Add a new password to storage
export function savePassword(passwordData: Omit<StoredPassword, "id" | "createdAt">): boolean {
  const existingPasswords = getStoredPasswords()

  const newPassword: StoredPassword = {
    ...passwordData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }

  const updatedPasswords = [newPassword, ...existingPasswords]
  return savePasswordsToCookies(updatedPasswords)
}

// Delete a password from storage
export function deletePassword(id: string): boolean {
  const existingPasswords = getStoredPasswords()
  const filteredPasswords = existingPasswords.filter((p) => p.id !== id)
  return savePasswordsToCookies(filteredPasswords)
}

// Update a password in storage
export function updatePassword(id: string, updates: Partial<StoredPassword>): boolean {
  const existingPasswords = getStoredPasswords()
  const updatedPasswords = existingPasswords.map((p) => (p.id === id ? { ...p, ...updates } : p))
  return savePasswordsToCookies(updatedPasswords)
}

// Generate a unique ID for passwords
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Get password statistics
export function getPasswordStats(): {
  total: number
  weak: number
  fair: number
  good: number
  strong: number
} {
  const passwords = getStoredPasswords()

  return {
    total: passwords.length,
    weak: passwords.filter((p) => p.strength < 30).length,
    fair: passwords.filter((p) => p.strength >= 30 && p.strength < 60).length,
    good: passwords.filter((p) => p.strength >= 60 && p.strength < 80).length,
    strong: passwords.filter((p) => p.strength >= 80).length,
  }
}

// Clear all stored passwords
export function clearAllPasswords(): boolean {
  if (typeof window === "undefined") return false

  try {
    document.cookie = `${STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    return true
  } catch (error) {
    console.error("Error clearing passwords:", error)
    return false
  }
}

// Export passwords to various formats
export function exportPasswords(options: ExportOptions): string {
  const passwords = getStoredPasswords()
  const dataToExport = options.selectedIds ? passwords.filter((p) => options.selectedIds!.includes(p.id)) : passwords

  switch (options.format) {
    case "json":
      return exportToJSON(dataToExport, options)
    case "csv":
      return exportToCSV(dataToExport, options)
    case "txt":
      return exportToTXT(dataToExport, options)
    default:
      throw new Error("Unsupported export format")
  }
}

// Export to JSON format
function exportToJSON(passwords: StoredPassword[], options: ExportOptions): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    totalPasswords: passwords.length,
    passwords: passwords.map((password) => {
      const exportPassword: any = {
        id: password.id,
        label: password.label,
        createdAt: password.createdAt,
        strength: password.strength,
        length: password.length,
      }

      if (options.includePasswords) {
        exportPassword.password = password.password
      }

      if (options.includeMetadata) {
        exportPassword.settings = password.settings
        exportPassword.category = password.category
      }

      return exportPassword
    }),
  }

  return JSON.stringify(exportData, null, 2)
}

// Export to CSV format
function exportToCSV(passwords: StoredPassword[], options: ExportOptions): string {
  const headers = ["Label", "Created At", "Strength", "Length"]

  if (options.includePasswords) {
    headers.push("Password")
  }

  if (options.includeMetadata) {
    headers.push("Category", "Uppercase", "Lowercase", "Numbers", "Symbols", "Exclude Similar")
  }

  const csvRows = [headers.join(",")]

  passwords.forEach((password) => {
    const row = [
      `"${password.label}"`,
      `"${new Date(password.createdAt).toLocaleDateString()}"`,
      password.strength.toString(),
      password.length.toString(),
    ]

    if (options.includePasswords) {
      row.push(`"${password.password}"`)
    }

    if (options.includeMetadata) {
      row.push(
        `"${password.category || ""}"`,
        password.settings.includeUppercase.toString(),
        password.settings.includeLowercase.toString(),
        password.settings.includeNumbers.toString(),
        password.settings.includeSymbols.toString(),
        password.settings.excludeSimilar.toString(),
      )
    }

    csvRows.push(row.join(","))
  })

  return csvRows.join("\n")
}

// Export to TXT format
function exportToTXT(passwords: StoredPassword[], options: ExportOptions): string {
  const lines = [
    "SecurePass - Password Export",
    `Exported: ${new Date().toLocaleString()}`,
    `Total Passwords: ${passwords.length}`,
    "=".repeat(50),
    "",
  ]

  passwords.forEach((password, index) => {
    lines.push(`${index + 1}. ${password.label}`)
    lines.push(`   Created: ${new Date(password.createdAt).toLocaleDateString()}`)
    lines.push(`   Strength: ${password.strength}% (${getStrengthText(password.strength)})`)
    lines.push(`   Length: ${password.length} characters`)

    if (options.includePasswords) {
      lines.push(`   Password: ${password.password}`)
    }

    if (options.includeMetadata && password.category) {
      lines.push(`   Category: ${password.category}`)
    }

    lines.push("")
  })

  return lines.join("\n")
}

// Helper function to get strength text
function getStrengthText(strength: number): string {
  if (strength < 30) return "Weak"
  if (strength < 60) return "Fair"
  if (strength < 80) return "Good"
  return "Strong"
}

// Download file with given content
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Import passwords from JSON
export function importPasswords(jsonContent: string): ImportResult {
  const result: ImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    errors: [],
  }

  try {
    const importData = JSON.parse(jsonContent)

    if (!importData.passwords || !Array.isArray(importData.passwords)) {
      result.errors.push("Invalid file format: passwords array not found")
      return result
    }

    const existingPasswords = getStoredPasswords()
    const existingLabels = new Set(existingPasswords.map((p) => p.label.toLowerCase()))
    const newPasswords: StoredPassword[] = []

    importData.passwords.forEach((importPassword: any, index: number) => {
      try {
        // Validate required fields
        if (!importPassword.label || !importPassword.password) {
          result.errors.push(`Row ${index + 1}: Missing required fields (label or password)`)
          return
        }

        // Check for duplicates
        if (existingLabels.has(importPassword.label.toLowerCase())) {
          result.skipped++
          return
        }

        // Create new password object
        const newPassword: StoredPassword = {
          id: generateId(),
          label: importPassword.label,
          password: importPassword.password,
          strength: importPassword.strength || 0,
          length: importPassword.length || importPassword.password.length,
          createdAt: importPassword.createdAt || new Date().toISOString(),
          settings: importPassword.settings || {
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeSimilar: false,
          },
          category: importPassword.category,
        }

        newPasswords.push(newPassword)
        result.imported++
      } catch (error) {
        result.errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    })

    // Save imported passwords
    if (newPasswords.length > 0) {
      const allPasswords = [...newPasswords, ...existingPasswords]
      const success = savePasswordsToCookies(allPasswords)
      result.success = success

      if (!success) {
        result.errors.push("Failed to save imported passwords")
      }
    } else {
      result.success = true
    }
  } catch (error) {
    result.errors.push(`Parse error: ${error instanceof Error ? error.message : "Invalid JSON format"}`)
  }

  return result
}

// Generate backup filename
export function generateBackupFilename(format: string): string {
  const now = new Date()
  const dateStr = now.toISOString().split("T")[0]
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-")
  return `securepass-backup-${dateStr}-${timeStr}.${format}`
}

export function getCategories(): Category[] {
  if (typeof window === "undefined") return []

  try {
    const cookies = document.cookie.split(";")
    const categoryCookie = cookies.find((cookie) => cookie.trim().startsWith(`${CATEGORIES_KEY}=`))

    if (!categoryCookie) {
      // Initialize with default categories
      const defaultCategories = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }))
      saveCategoriesToCookies(defaultCategories)
      return defaultCategories
    }

    const cookieValue = categoryCookie.split("=")[1]
    const decodedValue = decodeURIComponent(cookieValue)
    return JSON.parse(decodedValue)
  } catch (error) {
    console.error("Error reading categories:", error)
    return []
  }
}

export function saveCategoriesToCookies(categories: Category[]): boolean {
  if (typeof window === "undefined") return false

  try {
    const jsonString = JSON.stringify(categories)
    const encodedValue = encodeURIComponent(jsonString)

    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)

    document.cookie = `${CATEGORIES_KEY}=${encodedValue}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`
    return true
  } catch (error) {
    console.error("Error saving categories:", error)
    return false
  }
}

export function addCategory(categoryData: Omit<Category, "id" | "createdAt">): boolean {
  const existingCategories = getCategories()

  // Check for duplicate names
  if (existingCategories.some((cat) => cat.name.toLowerCase() === categoryData.name.toLowerCase())) {
    return false
  }

  const newCategory: Category = {
    ...categoryData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }

  const updatedCategories = [...existingCategories, newCategory]
  return saveCategoriesToCookies(updatedCategories)
}

export function updateCategory(id: string, updates: Partial<Omit<Category, "id" | "createdAt">>): boolean {
  const existingCategories = getCategories()
  const updatedCategories = existingCategories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
  return saveCategoriesToCookies(updatedCategories)
}

export function deleteCategory(id: string): boolean {
  const existingCategories = getCategories()
  const categoryToDelete = existingCategories.find((cat) => cat.id === id)

  if (!categoryToDelete) return false

  // Remove category from all passwords
  const passwords = getStoredPasswords()
  const updatedPasswords = passwords.map((password) =>
    password.category === categoryToDelete.name ? { ...password, category: undefined } : password,
  )
  savePasswordsToCookies(updatedPasswords)

  // Remove category
  const filteredCategories = existingCategories.filter((cat) => cat.id !== id)
  return saveCategoriesToCookies(filteredCategories)
}

export function getCategoryStats(): CategoryStats {
  const passwords = getStoredPasswords()
  const categories = getCategories()
  const stats: CategoryStats = {}

  // Initialize stats for all categories
  categories.forEach((category) => {
    stats[category.name] = {
      total: 0,
      weak: 0,
      fair: 0,
      good: 0,
      strong: 0,
    }
  })

  // Add uncategorized
  stats["Uncategorized"] = {
    total: 0,
    weak: 0,
    fair: 0,
    good: 0,
    strong: 0,
  }

  // Count passwords by category
  passwords.forEach((password) => {
    const categoryName = password.category || "Uncategorized"
    if (!stats[categoryName]) {
      stats[categoryName] = { total: 0, weak: 0, fair: 0, good: 0, strong: 0 }
    }

    stats[categoryName].total++

    if (password.strength < 30) stats[categoryName].weak++
    else if (password.strength < 60) stats[categoryName].fair++
    else if (password.strength < 80) stats[categoryName].good++
    else stats[categoryName].strong++
  })

  return stats
}

export function getPasswordsByCategory(categoryName?: string): StoredPassword[] {
  const passwords = getStoredPasswords()

  if (!categoryName) return passwords

  if (categoryName === "Uncategorized") {
    return passwords.filter((p) => !p.category)
  }

  return passwords.filter((p) => p.category === categoryName)
}

export function bulkUpdatePasswordCategory(passwordIds: string[], categoryName?: string): boolean {
  const passwords = getStoredPasswords()
  const updatedPasswords = passwords.map((password) =>
    passwordIds.includes(password.id) ? { ...password, category: categoryName } : password,
  )
  return savePasswordsToCookies(updatedPasswords)
}
