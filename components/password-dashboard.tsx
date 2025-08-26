"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Shield,
  BarChart3,
  Download,
  AlertTriangle,
  CheckCircle2,
  Upload,
  FileText,
  FileJson,
  FileSpreadsheet,
  Import,
  Plus,
  Edit,
  Tag,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getStoredPasswords,
  deletePassword,
  getPasswordStats,
  clearAllPasswords,
  exportPasswords,
  downloadFile,
  importPasswords,
  generateBackupFilename,
  updatePassword,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  bulkUpdatePasswordCategory,
  type StoredPassword,
  type ExportOptions,
  type ImportResult,
  type Category,
  type CategoryStats,
} from "@/lib/password-storage"
import { ThemeToggle } from "@/components/theme-toggle"

interface PasswordDashboardProps {
  onClose: () => void
}

export function PasswordDashboard({ onClose }: PasswordDashboardProps) {
  const [passwords, setPasswords] = useState<StoredPassword[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPasswords, setSelectedPasswords] = useState<string[]>([])
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [sortBy, setSortBy] = useState<"date" | "strength" | "label">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [strengthFilter, setStrengthFilter] = useState<"all" | "weak" | "fair" | "good" | "strong">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showBulkCategoryDialog, setShowBulkCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({ name: "", color: "#10b981", icon: "📁" })
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "json",
    includePasswords: true,
    includeMetadata: true,
  })
  const [importContent, setImportContent] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    weak: 0,
    fair: 0,
    good: 0,
    strong: 0,
  })
  const { toast } = useToast()

  const loadData = () => {
    const storedPasswords = getStoredPasswords()
    const storedCategories = getCategories()
    setPasswords(storedPasswords)
    setCategories(storedCategories)
    setStats(getPasswordStats())
    setCategoryStats(getCategoryStats())
  }

  const filteredAndSortedPasswords = useMemo(() => {
    const filtered = passwords.filter((password) => {
      const matchesSearch = password.label.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStrength =
        strengthFilter === "all" ||
        (strengthFilter === "weak" && password.strength < 30) ||
        (strengthFilter === "fair" && password.strength >= 30 && password.strength < 60) ||
        (strengthFilter === "good" && password.strength >= 60 && password.strength < 80) ||
        (strengthFilter === "strong" && password.strength >= 80)

      const matchesCategory =
        categoryFilter === "all" ||
        (categoryFilter === "uncategorized" && !password.category) ||
        password.category === categoryFilter

      return matchesSearch && matchesStrength && matchesCategory
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "strength":
          comparison = a.strength - b.strength
          break
        case "label":
          comparison = a.label.localeCompare(b.label)
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [passwords, searchTerm, sortBy, sortOrder, strengthFilter, categoryFilter])

  const handleCopyPassword = async (password: string, label: string) => {
    try {
      await navigator.clipboard.writeText(password)
      toast({
        title: "Copied!",
        description: `Password "${label}" copied to clipboard`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      })
    }
  }

  const handleDeletePassword = (id: string, label: string) => {
    const success = deletePassword(id)
    if (success) {
      toast({
        title: "Deleted",
        description: `Password "${label}" deleted`,
      })
      loadData()
      setSelectedPasswords((prev) => prev.filter((selectedId) => selectedId !== id))
    } else {
      toast({
        title: "Error",
        description: "Failed to delete password",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePasswordCategory = (passwordId: string, categoryName?: string) => {
    const success = updatePassword(passwordId, { category: categoryName })
    if (success) {
      toast({
        title: "Updated",
        description: `Password category updated`,
      })
      loadData()
    } else {
      toast({
        title: "Error",
        description: "Failed to update password category",
        variant: "destructive",
      })
    }
  }

  const handleBulkCategoryUpdate = (categoryName?: string) => {
    const success = bulkUpdatePasswordCategory(selectedPasswords, categoryName)
    if (success) {
      toast({
        title: "Updated",
        description: `${selectedPasswords.length} password(s) updated`,
      })
      loadData()
      setSelectedPasswords([])
      setShowBulkCategoryDialog(false)
    } else {
      toast({
        title: "Error",
        description: "Failed to update password categories",
        variant: "destructive",
      })
    }
  }

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    const success = addCategory(newCategory)
    if (success) {
      toast({
        title: "Added",
        description: `Category "${newCategory.name}" created`,
      })
      setNewCategory({ name: "", color: "#10b981", icon: "📁" })
      setShowCategoryDialog(false)
      loadData()
    } else {
      toast({
        title: "Error",
        description: "Category name already exists",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategory.name.trim()) return

    const success = updateCategory(editingCategory.id, {
      name: newCategory.name,
      color: newCategory.color,
      icon: newCategory.icon,
    })

    if (success) {
      toast({
        title: "Updated",
        description: `Category "${newCategory.name}" updated`,
      })
      setEditingCategory(null)
      setNewCategory({ name: "", color: "#10b981", icon: "📁" })
      setShowCategoryDialog(false)
      loadData()
    } else {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    const success = deleteCategory(categoryId)
    if (success) {
      toast({
        title: "Deleted",
        description: `Category "${categoryName}" deleted`,
      })
      loadData()
    } else {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const openEditCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      color: category.color,
      icon: category.icon,
    })
    setShowCategoryDialog(true)
  }

  const openAddCategory = () => {
    setEditingCategory(null)
    setNewCategory({ name: "", color: "#10b981", icon: "📁" })
    setShowCategoryDialog(true)
  }

  const handleBulkDelete = () => {
    let successCount = 0
    selectedPasswords.forEach((id) => {
      if (deletePassword(id)) {
        successCount++
      }
    })

    if (successCount > 0) {
      toast({
        title: "Deleted",
        description: `${successCount} password(s) deleted`,
      })
      loadData()
      setSelectedPasswords([])
    }
  }

  const handleClearAll = () => {
    const success = clearAllPasswords()
    if (success) {
      toast({
        title: "Cleared",
        description: "All passwords have been deleted",
      })
      loadData()
      setSelectedPasswords([])
    } else {
      toast({
        title: "Error",
        description: "Failed to clear passwords",
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    try {
      const options: ExportOptions = {
        ...exportOptions,
        selectedIds: selectedPasswords.length > 0 ? selectedPasswords : undefined,
      }

      const content = exportPasswords(options)
      const filename = generateBackupFilename(exportOptions.format)

      let mimeType = "text/plain"
      switch (exportOptions.format) {
        case "json":
          mimeType = "application/json"
          break
        case "csv":
          mimeType = "text/csv"
          break
        case "txt":
          mimeType = "text/plain"
          break
      }

      downloadFile(content, filename, mimeType)

      const count = selectedPasswords.length > 0 ? selectedPasswords.length : passwords.length
      toast({
        title: "Export Complete",
        description: `${count} password(s) exported as ${exportOptions.format.toUpperCase()}`,
      })

      setShowExportDialog(false)
      setSelectedPasswords([])
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleImport = () => {
    if (!importContent.trim()) {
      toast({
        title: "Error",
        description: "Please paste the backup content",
        variant: "destructive",
      })
      return
    }

    try {
      const result: ImportResult = importPasswords(importContent)

      if (result.success) {
        loadData()
        toast({
          title: "Import Complete",
          description: `${result.imported} password(s) imported, ${result.skipped} skipped`,
        })

        if (result.errors.length > 0) {
          console.warn("Import warnings:", result.errors)
        }
      } else {
        toast({
          title: "Import Failed",
          description: result.errors[0] || "Unknown error occurred",
          variant: "destructive",
        })
      }

      setShowImportDialog(false)
      setImportContent("")
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Invalid backup format",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportContent(content)
    }
    reader.readAsText(file)
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleSelectPassword = (id: string) => {
    setSelectedPasswords((prev) => (prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]))
  }

  const selectAllPasswords = () => {
    if (selectedPasswords.length === filteredAndSortedPasswords.length) {
      setSelectedPasswords([])
    } else {
      setSelectedPasswords(filteredAndSortedPasswords.map((p) => p.id))
    }
  }

  const getCategoryColor = (categoryName?: string) => {
    if (!categoryName) return "#6b7280"
    const category = categories.find((cat) => cat.name === categoryName)
    return category?.color || "#6b7280"
  }

  const getCategoryIcon = (categoryName?: string) => {
    if (!categoryName) return "📁"
    const category = categories.find((cat) => cat.name === categoryName)
    return category?.icon || "📁"
  }

  const getStrengthLabel = (strength: number) => {
    if (strength < 30) return { label: "Weak", color: "bg-red-500", textColor: "text-red-700" }
    if (strength < 60) return { label: "Fair", color: "bg-amber-500", textColor: "text-amber-700" }
    if (strength < 80) return { label: "Good", color: "bg-emerald-500", textColor: "text-emerald-700" }
    return { label: "Strong", color: "bg-emerald-600", textColor: "text-emerald-700" }
  }

  const getPasswordAge = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-serif">Password Dashboard</h2>
          <p className="text-muted-foreground">Manage and organize your saved passwords</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Passwords</DialogTitle>
                <DialogDescription>Import passwords from a SecurePass backup file (JSON format)</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload Backup File</Label>
                  <Input id="file-upload" type="file" accept=".json" onChange={handleFileUpload} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="import-content">Or Paste Backup Content</Label>
                  <Textarea
                    id="import-content"
                    placeholder="Paste your backup JSON content here..."
                    value={importContent}
                    onChange={(e) => setImportContent(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImport}>
                  <Import className="h-4 w-4 mr-2" />
                  Import Passwords
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Passwords</DialogTitle>
                <DialogDescription>
                  {selectedPasswords.length > 0
                    ? `Export ${selectedPasswords.length} selected password(s)`
                    : `Export all ${passwords.length} password(s)`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: any) => setExportOptions((prev) => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileJson className="h-4 w-4" />
                          JSON (Recommended for backup)
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          CSV (Spreadsheet compatible)
                        </div>
                      </SelectItem>
                      <SelectItem value="txt">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          TXT (Human readable)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Export Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-passwords"
                        checked={exportOptions.includePasswords}
                        onCheckedChange={(checked) =>
                          setExportOptions((prev) => ({ ...prev, includePasswords: checked }))
                        }
                      />
                      <Label htmlFor="include-passwords">Include actual passwords</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-metadata"
                        checked={exportOptions.includeMetadata}
                        onCheckedChange={(checked) =>
                          setExportOptions((prev) => ({ ...prev, includeMetadata: checked }))
                        }
                      />
                      <Label htmlFor="include-metadata">Include settings and metadata</Label>
                    </div>
                  </div>
                </div>
                {!exportOptions.includePasswords && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      Passwords will not be included. This export cannot be used for backup restoration.
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={onClose}>
            Close Dashboard
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="passwords">All Passwords</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Weak</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.weak}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-amber-500" />
                  <span className="text-sm text-muted-foreground">Fair</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{stats.fair}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-emerald-500" />
                  <span className="text-sm text-muted-foreground">Good</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{stats.good}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-muted-foreground">Strong</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">{stats.strong}</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Categories Overview</CardTitle>
              <CardDescription>Password distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categoryStats).map(([categoryName, stats]) => (
                  <div key={categoryName} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {getCategoryIcon(categoryName === "Uncategorized" ? undefined : categoryName)}
                      </span>
                      <h4 className="font-medium">{categoryName}</h4>
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${getCategoryColor(categoryName === "Uncategorized" ? undefined : categoryName)}20`,
                          borderColor: getCategoryColor(categoryName === "Uncategorized" ? undefined : categoryName),
                        }}
                      >
                        {stats.total}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-emerald-600">Strong: {stats.strong}</span>
                        <span className="text-emerald-600">Good: {stats.good}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600">Fair: {stats.fair}</span>
                        <span className="text-red-600">Weak: {stats.weak}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Passwords */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Passwords</CardTitle>
              <CardDescription>Your 5 most recently created passwords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {passwords.slice(0, 5).map((password) => (
                  <div key={password.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{getCategoryIcon(password.category)}</span>
                        <h4 className="font-medium truncate">{password.label}</h4>
                        {password.category && (
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${getCategoryColor(password.category)}20`,
                              borderColor: getCategoryColor(password.category),
                            }}
                          >
                            {password.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{getPasswordAge(password.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getStrengthLabel(password.strength).color}>
                        {getStrengthLabel(password.strength).label}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPassword(password.password, password.label)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {passwords.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No passwords saved yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passwords" className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search passwords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={strengthFilter} onValueChange={(value: any) => setStrengthFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strengths</SelectItem>
                <SelectItem value="weak">Weak</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-")
                setSortBy(field as any)
                setSortOrder(order as any)
              }}
            >
              <SelectTrigger className="w-[140px]">
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="strength-desc">Strongest First</SelectItem>
                <SelectItem value="strength-asc">Weakest First</SelectItem>
                <SelectItem value="label-asc">A to Z</SelectItem>
                <SelectItem value="label-desc">Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedPasswords.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedPasswords.length} selected</span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Selected
              </Button>
              <Dialog open={showBulkCategoryDialog} onOpenChange={setShowBulkCategoryDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Tag className="h-3 w-3 mr-1" />
                    Set Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Category for Selected Passwords</DialogTitle>
                    <DialogDescription>
                      Choose a category for {selectedPasswords.length} selected password(s)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select onValueChange={(value) => handleBulkCategoryUpdate(value === "none" ? undefined : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            <div className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBulkCategoryDialog(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                <Download className="h-3 w-3 mr-1" />
                Export Selected
              </Button>
            </div>
          )}

          {/* Password List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Passwords ({filteredAndSortedPasswords.length})</CardTitle>
                  <CardDescription>Manage your saved passwords</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllPasswords}>
                    {selectedPasswords.length === filteredAndSortedPasswords.length ? "Deselect All" : "Select All"}
                  </Button>
                  {passwords.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleClearAll}>
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAndSortedPasswords.map((password) => (
                  <div key={password.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Checkbox
                      checked={selectedPasswords.includes(password.id)}
                      onCheckedChange={() => toggleSelectPassword(password.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{getCategoryIcon(password.category)}</span>
                        <h4 className="font-medium truncate">{password.label}</h4>
                        <Badge variant="secondary" className={getStrengthLabel(password.strength).color}>
                          {getStrengthLabel(password.strength).label}
                        </Badge>
                        {password.category && (
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${getCategoryColor(password.category)}20`,
                              borderColor: getCategoryColor(password.category),
                            }}
                          >
                            {password.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getPasswordAge(password.createdAt)}
                        </span>
                        <span>{password.length} characters</span>
                      </div>
                      <div className="mt-2">
                        <Input
                          type={showPasswords[password.id] ? "text" : "password"}
                          value={password.password}
                          readOnly
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="mt-2">
                        <Select
                          value={password.category || "none"}
                          onValueChange={(value) =>
                            handleUpdatePasswordCategory(password.id, value === "none" ? undefined : value)
                          }
                        >
                          <SelectTrigger className="w-[200px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                <div className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => togglePasswordVisibility(password.id)}>
                        {showPasswords[password.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPassword(password.password, password.label)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePassword(password.id, password.label)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredAndSortedPasswords.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No passwords found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Category Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage Categories</CardTitle>
                  <CardDescription>Organize your passwords with custom categories</CardDescription>
                </div>
                <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={openAddCategory}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                      <DialogDescription>
                        {editingCategory
                          ? "Update category details"
                          : "Create a new category to organize your passwords"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input
                          id="category-name"
                          placeholder="e.g., Work, Personal, Banking..."
                          value={newCategory.name}
                          onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-icon">Icon</Label>
                        <Input
                          id="category-icon"
                          placeholder="📁"
                          value={newCategory.icon}
                          onChange={(e) => setNewCategory((prev) => ({ ...prev, icon: e.target.value }))}
                          maxLength={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-color">Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="category-color"
                            type="color"
                            value={newCategory.color}
                            onChange={(e) => setNewCategory((prev) => ({ ...prev, color: e.target.value }))}
                            className="w-16 h-10"
                          />
                          <Input
                            value={newCategory.color}
                            onChange={(e) => setNewCategory((prev) => ({ ...prev, color: e.target.value }))}
                            placeholder="#10b981"
                          />
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <Badge
                          variant="outline"
                          style={{ backgroundColor: `${newCategory.color}20`, borderColor: newCategory.color }}
                        >
                          <span className="mr-1">{newCategory.icon}</span>
                          {newCategory.name || "Category Name"}
                        </Badge>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                        {editingCategory ? "Update" : "Add"} Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <h4 className="font-medium">{category.name}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditCategory(category)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Badge
                        variant="outline"
                        style={{ backgroundColor: `${category.color}20`, borderColor: category.color }}
                      >
                        {categoryStats[category.name]?.total || 0} passwords
                      </Badge>
                      <div className="text-xs text-muted-foreground">Created {getPasswordAge(category.createdAt)}</div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${categoryStats[category.name]?.total ? (categoryStats[category.name].strong / categoryStats[category.name].total) * 100 : 0}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {categoryStats[category.name]?.strong || 0} strong passwords
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Security Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Security Analytics
              </CardTitle>
              <CardDescription>Overview of your password security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Security Score</span>
                  <span className="text-2xl font-bold">
                    {stats.total > 0
                      ? Math.round(
                          ((stats.strong * 100 + stats.good * 75 + stats.fair * 50 + stats.weak * 25) /
                            (stats.total * 100)) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    stats.total > 0
                      ? ((stats.strong * 100 + stats.good * 75 + stats.fair * 50 + stats.weak * 25) /
                          (stats.total * 100)) *
                        100
                      : 0
                  }
                  className="h-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Strength Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-600" />
                        Strong
                      </span>
                      <span>
                        {stats.strong} ({stats.total > 0 ? Math.round((stats.strong / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        Good
                      </span>
                      <span>
                        {stats.good} ({stats.total > 0 ? Math.round((stats.good / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        Fair
                      </span>
                      <span>
                        {stats.fair} ({stats.total > 0 ? Math.round((stats.fair / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        Weak
                      </span>
                      <span>
                        {stats.weak} ({stats.total > 0 ? Math.round((stats.weak / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recommendations</h4>
                  <div className="space-y-2 text-sm">
                    {stats.weak > 0 && (
                      <div className="flex items-start gap-2 text-red-600">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          Replace {stats.weak} weak password{stats.weak > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    {stats.fair > 0 && (
                      <div className="flex items-start gap-2 text-amber-600">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          Consider strengthening {stats.fair} fair password{stats.fair > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    {stats.strong > stats.total * 0.8 && (
                      <div className="flex items-start gap-2 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Great job! Most passwords are strong</span>
                      </div>
                    )}
                    {stats.total === 0 && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Start by generating and saving some passwords</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Category Security Analysis</CardTitle>
              <CardDescription>Security breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryStats).map(([categoryName, stats]) => (
                  <div key={categoryName} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getCategoryIcon(categoryName === "Uncategorized" ? undefined : categoryName)}
                        </span>
                        <h4 className="font-medium">{categoryName}</h4>
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: `${getCategoryColor(categoryName === "Uncategorized" ? undefined : categoryName)}20`,
                            borderColor: getCategoryColor(categoryName === "Uncategorized" ? undefined : categoryName),
                          }}
                        >
                          {stats.total} passwords
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">
                        {stats.total > 0
                          ? Math.round(
                              ((stats.strong * 100 + stats.good * 75 + stats.fair * 50 + stats.weak * 25) /
                                (stats.total * 100)) *
                                100,
                            )
                          : 0}
                        % secure
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress
                        value={
                          stats.total > 0
                            ? ((stats.strong * 100 + stats.good * 75 + stats.fair * 50 + stats.weak * 25) /
                                (stats.total * 100)) *
                              100
                            : 0
                        }
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="text-emerald-600">Strong: {stats.strong}</span>
                        <span className="text-emerald-500">Good: {stats.good}</span>
                        <span className="text-amber-500">Fair: {stats.fair}</span>
                        <span className="text-red-500">Weak: {stats.weak}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
