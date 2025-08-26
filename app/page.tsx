"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float, Center } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, RefreshCw, Shield, Lock, Eye, EyeOff, Save, Database, LayoutDashboard, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { savePassword, getPasswordStats, getCategories, type Category } from "@/lib/password-storage"
import { PasswordDashboard } from "@/components/password-dashboard"

// 3D Password Strength Indicator Component
function PasswordStrengthSphere({ strength }: { strength: number }) {
  const getColor = (strength: number) => {
    if (strength < 30) return "#ef4444" // red
    if (strength < 60) return "#f59e0b" // amber
    if (strength < 80) return "#10b981" // emerald
    return "#059669" // dark emerald
  }

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={getColor(strength)}
          metalness={0.7}
          roughness={0.2}
          emissive={getColor(strength)}
          emissiveIntensity={0.1}
        />
      </mesh>
    </Float>
  )
}

// 3D Floating Lock Component
function FloatingLock() {
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <Center>
        {/* Simple 3D Lock using basic geometry instead of Text3D */}
        <group>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.2]} />
            <meshStandardMaterial color="#059669" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Lock shackle */}
          <mesh position={[0, 0.4, 0]}>
            <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#059669" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </Center>
    </Float>
  )
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState([16])
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [strength, setStrength] = useState(0)
  const [passwordLabel, setPasswordLabel] = useState("")
  const [passwordCategory, setPasswordCategory] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [passwordStats, setPasswordStats] = useState({
    total: 0,
    weak: 0,
    fair: 0,
    good: 0,
    strong: 0,
  })
  const { toast } = useToast()

  // Password generation logic
  const generatePassword = () => {
    let charset = ""
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (includeNumbers) charset += "0123456789"
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, "")
    }

    if (charset === "") {
      toast({
        title: "Error",
        description: "Please select at least one character type",
        variant: "destructive",
      })
      return
    }

    let newPassword = ""
    for (let i = 0; i < length[0]; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    setPassword(newPassword)
    calculateStrength(newPassword)
  }

  // Password strength calculation
  const calculateStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score += 20
    if (pwd.length >= 12) score += 10
    if (pwd.length >= 16) score += 10
    if (/[a-z]/.test(pwd)) score += 15
    if (/[A-Z]/.test(pwd)) score += 15
    if (/[0-9]/.test(pwd)) score += 15
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15

    setStrength(Math.min(score, 100))
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      })
    }
  }

  const loadData = () => {
    setPasswordStats(getPasswordStats())
    setCategories(getCategories())
  }

  const handleSavePassword = () => {
    if (!password) {
      toast({
        title: "Error",
        description: "No password to save",
        variant: "destructive",
      })
      return
    }

    const label = passwordLabel.trim() || `Password ${new Date().toLocaleDateString()}`

    const success = savePassword({
      password,
      label,
      strength,
      length: length[0],
      category: passwordCategory || undefined,
      settings: {
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        excludeSimilar,
      },
    })

    if (success) {
      toast({
        title: "Saved!",
        description: `Password "${label}" saved successfully`,
      })
      setPasswordLabel("")
      setPasswordCategory("")
      setShowSaveDialog(false)
      loadData()
    } else {
      toast({
        title: "Error",
        description: "Failed to save password",
        variant: "destructive",
      })
    }
  }

  const getStrengthLabel = (strength: number) => {
    if (strength < 30) return { label: "Weak", color: "bg-red-500" }
    if (strength < 60) return { label: "Fair", color: "bg-amber-500" }
    if (strength < 80) return { label: "Good", color: "bg-emerald-500" }
    return { label: "Strong", color: "bg-emerald-600" }
  }

  useEffect(() => {
    generatePassword()
    loadData()
  }, [])

  if (showDashboard) {
    return <PasswordDashboard onClose={() => setShowDashboard(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 3D Background Scene */}
      <div className="fixed inset-0 w-full h-full">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Environment preset="studio" />

          {/* 3D Elements */}
          <group position={[-3, 1, 0]}>
            <FloatingLock />
          </group>

          <group position={[3, -1, 0]}>
            <PasswordStrengthSphere strength={strength} />
          </group>

          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold font-serif bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SecurePass
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate ultra-secure passwords with our advanced interface. No login required - your passwords are
              stored locally for instant access.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="text-sm">
                <Database className="h-3 w-3 mr-1" />
                {passwordStats.total} Saved
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Shield className="h-3 w-3 mr-1" />
                {passwordStats.strong} Strong
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Password Generator */}
            <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password Generator
                </CardTitle>
                <CardDescription>Customize your password settings and generate secure passwords</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Generated Password Display */}
                <div className="space-y-2">
                  <Label htmlFor="password">Generated Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Save className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save Password</DialogTitle>
                          <DialogDescription>
                            Give your password a label and category to easily identify it later.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="label">Password Label</Label>
                            <Input
                              id="label"
                              placeholder="e.g., Gmail Account, Work WiFi..."
                              value={passwordLabel}
                              onChange={(e) => setPasswordLabel(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category (Optional)</Label>
                            <Select value={passwordCategory} onValueChange={setPasswordCategory}>
                              <SelectTrigger>
                                <Tag className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
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
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-mono break-all">{password}</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSavePassword}>Save Password</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Password Strength */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Password Strength</Label>
                    <Badge variant="secondary" className={getStrengthLabel(strength).color}>
                      {getStrengthLabel(strength).label}
                    </Badge>
                  </div>
                  <Progress value={strength} className="h-3" />
                </div>

                {/* Length Slider */}
                <div className="space-y-2">
                  <Label>Length: {length[0]}</Label>
                  <Slider value={length} onValueChange={setLength} max={128} min={4} step={1} className="w-full" />
                </div>

                {/* Character Options */}
                <div className="space-y-4">
                  <Label>Character Types</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
                      <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="lowercase" checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
                      <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
                      <Label htmlFor="numbers">Numbers (0-9)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
                      <Label htmlFor="symbols">Symbols (!@#$)</Label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="exclude-similar" checked={excludeSimilar} onCheckedChange={setExcludeSimilar} />
                    <Label htmlFor="exclude-similar">Exclude similar characters (i, l, 1, L, o, 0, O)</Label>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="space-y-3">
                  <Button onClick={generatePassword} className="w-full text-lg py-6" size="lg">
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Generate New Password
                  </Button>
                  <Button variant="outline" onClick={() => setShowDashboard(true)} className="w-full">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Open Password Dashboard ({passwordStats.total})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Password Tips */}
            <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-2xl">
              <CardHeader>
                <CardTitle>Security Tips</CardTitle>
                <CardDescription>Best practices for password security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">Use at least 12 characters for better security</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">Include a mix of uppercase, lowercase, numbers, and symbols</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">Avoid using personal information or common words</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">Use unique passwords for each account</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">Store passwords securely and never share them</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">Cookie Storage</h4>
                  <p className="text-sm text-muted-foreground">
                    Your generated passwords are stored locally in browser cookies. No account required - access your
                    passwords anytime as long as cookies remain intact.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
