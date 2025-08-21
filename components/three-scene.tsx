"use client"

import { useEffect, useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"

function useDarkModeFlag() {
	const [isDark, setIsDark] = useState(true)
	useEffect(() => {
		const checkTheme = () => setIsDark(document.documentElement.classList.contains("dark"))
		checkTheme()
		const observer = new MutationObserver(checkTheme)
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
		return () => observer.disconnect()
	}, [])
	return isDark
}

function PasswordStrengthSphere({ strength }: { strength: number }) {
	const isDark = useDarkModeFlag()
	const getColor = (s: number) => {
		if (s < 30) return "#ef4444"
		if (s < 60) return "#f59e0b"
		if (s < 80) return "#10b981"
		return "#059669"
	}
	return (
		<Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
			<mesh>
				<sphereGeometry args={[0.8, 32, 32]} />
				<meshStandardMaterial
					color={getColor(strength)}
					metalness={isDark ? 0.95 : 0.7}
					roughness={isDark ? 0.05 : 0.2}
					emissive={getColor(strength)}
					emissiveIntensity={isDark ? 0.25 : 0.1}
				/>
			</mesh>
		</Float>
	)
}

function FloatingLock() {
	const isDark = useDarkModeFlag()
	return (
		<Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
			<mesh>
				<torusKnotGeometry args={[0.45, 0.12, 128, 16]} />
				<meshStandardMaterial
					color={isDark ? "#10b981" : "#059669"}
					metalness={isDark ? 0.95 : 0.8}
					roughness={isDark ? 0.05 : 0.2}
					emissive={isDark ? "#10b981" : "#059669"}
					emissiveIntensity={isDark ? 0.15 : 0.05}
				/>
			</mesh>
		</Float>
	)
}

function BackgroundParticles() {
	const isDark = useDarkModeFlag()
	// Generate deterministic particle data on the client only after mount
	const [seed, setSeed] = useState<number | null>(null)
	useEffect(() => setSeed(Date.now()), [])
	const particles = useMemo(() => {
		if (seed === null) return null
		let s = seed
		const rand = () => {
			s = (s * 1664525 + 1013904223) % 4294967296
			return s / 4294967296
		}
		return Array.from({ length: 20 }, (_, i) => ({
			key: i,
			speed: 0.5 + rand(),
			position: [(rand() - 0.5) * 20, (rand() - 0.5) * 20, (rand() - 0.5) * 20] as [number, number, number],
		}))
	}, [seed])
	if (!particles) return null
	return (
		<>
			{particles.map((p) => (
				<Float key={p.key} speed={p.speed} rotationIntensity={0.2} floatIntensity={0.2}>
					<mesh position={p.position}>
						<sphereGeometry args={[0.05, 8, 8]} />
						<meshStandardMaterial
							color={isDark ? "#10b981" : "#059669"}
							metalness={isDark ? 0.9 : 0.8}
							roughness={isDark ? 0.1 : 0.2}
							emissive={isDark ? "#10b981" : "#059669"}
							emissiveIntensity={isDark ? 0.4 : 0.1}
						/>
					</mesh>
				</Float>
			))}
		</>
	)
}

export function ThreeScene({ strength }: { strength: number }) {
	const isDark = useDarkModeFlag()
	return (
		<div className="fixed inset-0 w-full h-full">
			<Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
				{/* Ensure a non-white background regardless of page theme */}
				<color attach="background" args={[isDark ? "#0b0f0c" : "#0b0f0c"]} />
				<ambientLight intensity={0.4} />
				<pointLight position={[10, 10, 10]} intensity={1.2} color="#10b981" />
				<pointLight position={[-10, -10, -10]} intensity={0.8} color="#059669" />
				<pointLight position={[0, -10, 5]} intensity={0.6} color="#34d399" />
				<Environment preset="night" />
				<BackgroundParticles />
				<group position={[-3, 1, 0]}>
					<FloatingLock />
				</group>
				<group position={[3, -1, 0]}>
					<PasswordStrengthSphere strength={strength} />
				</group>
				<OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
			</Canvas>
		</div>
	)
}


