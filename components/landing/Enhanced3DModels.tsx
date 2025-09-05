'use client'

import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Box, Cylinder, Cone } from '@react-three/drei'
import * as THREE from 'three'

// High-quality spaceship model built with primitives
function SpaceshipModel({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  const shipRef = useRef<THREE.Group>(null)
  const engineRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (shipRef.current) {
      shipRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      shipRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5
    }
    if (engineRef.current) {
      // Engine glow effect
      engineRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial
          if (material.emissive) {
            material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 4 + i) * 0.3
          }
        }
      })
    }
  })

  return (
    <group ref={shipRef} position={position} scale={scale}>
      {/* Main hull */}
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.3, 0.8, 3, 8]} />
        <meshStandardMaterial color="#2563eb" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Wings */}
      <mesh position={[-0.7, 0, 0.5]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[2, 0.1, 0.8]} />
        <meshStandardMaterial color="#1e40af" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.7, 0, 0.5]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[2, 0.1, 0.8]} />
        <meshStandardMaterial color="#1e40af" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Cockpit */}
      <mesh position={[0, 0.2, 1.2]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color="#06b6d4" 
          transparent 
          opacity={0.8} 
          emissive="#06b6d4"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Engines */}
      <group ref={engineRef}>
        <mesh position={[-0.5, -0.2, -1.2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
          <meshStandardMaterial 
            color="#f97316" 
            emissive="#f97316"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0.5, -0.2, -1.2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
          <meshStandardMaterial 
            color="#f97316" 
            emissive="#f97316"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0, -0.2, -1.2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.6, 8]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            emissive="#fbbf24"
            emissiveIntensity={0.7}
          />
        </mesh>
      </group>
    </group>
  )
}

// Creative abstract crystal formation
function CrystalFormation({ position }: { position: [number, number, number] }) {
  const crystalRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y = state.clock.elapsedTime * 0.2
      crystalRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group ref={crystalRef} position={position}>
      {/* Main crystal */}
      <mesh>
        <octahedronGeometry args={[1, 2]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          transparent
          opacity={0.8}
          distort={0.1}
          speed={2}
          emissive="#8b5cf6"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Smaller crystals around */}
      {[...Array(6)].map((_, i) => (
        <Float key={i} speed={1 + i * 0.1} rotationIntensity={0.5}>
          <mesh position={[
            Math.cos(i * Math.PI / 3) * 2,
            Math.sin(i * Math.PI / 4) * 1.5,
            Math.sin(i * Math.PI / 3) * 2
          ]}>
            <octahedronGeometry args={[0.3 + Math.random() * 0.2, 1]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#a855f7" : "#c084fc"}
              transparent
              opacity={0.7}
              emissive={i % 2 === 0 ? "#a855f7" : "#c084fc"}
              emissiveIntensity={0.15}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// Futuristic data nodes
function DataNodes({ position }: { position: [number, number, number] }) {
  const nodesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (nodesRef.current) {
      nodesRef.current.children.forEach((child, i) => {
        child.rotation.x = state.clock.elapsedTime * (0.5 + i * 0.1)
        child.rotation.y = state.clock.elapsedTime * (0.3 + i * 0.05)
      })
    }
  })

  return (
    <group ref={nodesRef} position={position}>
      {/* Central node */}
      <Sphere args={[0.6, 32, 32]}>
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      {/* Orbiting data cubes */}
      {[...Array(8)].map((_, i) => (
        <Float key={i} speed={1.5 + i * 0.1} rotationIntensity={0.3}>
          <mesh position={[
            Math.cos(i * Math.PI / 4) * 3,
            Math.sin(i * Math.PI / 6) * 2,
            Math.sin(i * Math.PI / 4) * 3
          ]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={0.4}
              transparent
              opacity={0.9}
            />
          </mesh>
        </Float>
      ))}
      
      {/* Connecting lines effect */}
      <mesh>
        <torusGeometry args={[3, 0.02, 8, 32]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

// Professional director's clapperboard
function DirectorClapperboard({ position }: { position: [number, number, number] }) {
  const clapperRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (clapperRef.current) {
      clapperRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.1
      clapperRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.3
    }
  })

  return (
    <group ref={clapperRef} position={position} rotation={[0.2, 0.3, 0]}>
      {/* Main board */}
      <mesh>
        <boxGeometry args={[1.5, 1, 0.1]} />
        <meshStandardMaterial color="#1f2937" metalness={0.1} roughness={0.8} />
      </mesh>
      
      {/* Top clapper */}
      <mesh position={[0, 0.4, 0.05]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1.5, 0.3, 0.05]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Stripes */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[-0.6 + i * 0.4, 0.4, 0.06]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.01]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#000000" : "#ffffff"} />
        </mesh>
      ))}
      
      {/* Text board effect */}
      <mesh position={[0, -0.2, 0.06]}>
        <boxGeometry args={[1.2, 0.5, 0.01]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  )
}

// Enhanced 3D models collection with error boundaries
export function Enhanced3DModels() {
  return (
    <Suspense fallback={null}>
      {/* Hero Spaceship - Main focal point */}
      <Float speed={0.8} rotationIntensity={0.2}>
        <SpaceshipModel position={[0, 2, -8]} scale={1.5} />
      </Float>
      
      {/* Secondary spaceships */}
      <Float speed={1.2} rotationIntensity={0.3}>
        <SpaceshipModel position={[-12, -3, -15]} scale={0.8} />
      </Float>
      <Float speed={0.9} rotationIntensity={0.2}>
        <SpaceshipModel position={[15, 4, -20]} scale={0.6} />
      </Float>
      
      {/* Crystal formations */}
      <Float speed={1.1} rotationIntensity={0.4}>
        <CrystalFormation position={[-8, 6, -12]} />
      </Float>
      <Float speed={0.7} rotationIntensity={0.3}>
        <CrystalFormation position={[10, -4, -18]} />
      </Float>
      
      {/* Data nodes */}
      <Float speed={1.3} rotationIntensity={0.5}>
        <DataNodes position={[8, 2, -10]} />
      </Float>
      <Float speed={0.8} rotationIntensity={0.2}>
        <DataNodes position={[-15, -1, -25]} />
      </Float>
      
      {/* Director elements */}
      <Float speed={1.5} rotationIntensity={0.4}>
        <DirectorClapperboard position={[-5, -5, -8]} />
      </Float>
      <Float speed={1.0} rotationIntensity={0.3}>
        <DirectorClapperboard position={[12, 7, -15]} />
      </Float>
      
      {/* Additional creative elements */}
      <Float speed={0.6} rotationIntensity={0.2}>
        <mesh position={[0, -8, -30]} rotation={[0.5, 0.3, 0]}>
          <torusKnotGeometry args={[2, 0.3, 64, 16]} />
          <MeshDistortMaterial
            color="#f59e0b"
            distort={0.3}
            speed={1}
            emissive="#f59e0b"
            emissiveIntensity={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>
      </Float>
    </Suspense>
  )
}