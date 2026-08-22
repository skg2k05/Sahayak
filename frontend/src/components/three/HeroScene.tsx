import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const GOLD = '#F0B90B';
const GOLD_DARK = '#B45309';

function RupeeCoin() {
  const spinRef = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Group>(null);
  const reduced = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (reduced) return;
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.45;
    if (bobRef.current) bobRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.09;
  });

  return (
    <group ref={bobRef}>
      <group ref={spinRef} rotation={[Math.PI / 2, 0, 0]}>
        {/* Coin body */}
        <mesh castShadow>
          <cylinderGeometry args={[1.18, 1.18, 0.22, 64]} />
          <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.28} />
        </mesh>
        {/* Raised rim */}
        <mesh>
          <torusGeometry args={[1.18, 0.075, 24, 80]} />
          <meshStandardMaterial color="#FFD54F" metalness={0.95} roughness={0.18} />
        </mesh>
        {/* Embossed inner ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.82, 0.028, 16, 72]} />
          <meshStandardMaterial color={GOLD_DARK} metalness={0.9} roughness={0.32} />
        </mesh>

        {/* Stylised ₹ emblem built from bars, sitting proud of the face */}
        <group position={[0.04, 0, 0.125]}>
          <mesh position={[-0.28, 0, 0]}>
            <boxGeometry args={[0.13, 0.92, 0.05]} />
            <meshStandardMaterial color={GOLD_DARK} metalness={0.75} roughness={0.35} />
          </mesh>
          <mesh position={[0.08, 0.3, 0]}>
            <boxGeometry args={[0.88, 0.13, 0.05]} />
            <meshStandardMaterial color={GOLD_DARK} metalness={0.75} roughness={0.35} />
          </mesh>
          <mesh position={[0.01, 0.02, 0]}>
            <boxGeometry args={[0.74, 0.13, 0.05]} />
            <meshStandardMaterial color={GOLD_DARK} metalness={0.75} roughness={0.35} />
          </mesh>
          <mesh position={[0.34, -0.36, 0]} rotation={[0, 0, -0.65]}>
            <boxGeometry args={[0.13, 0.62, 0.05]} />
            <meshStandardMaterial color={GOLD_DARK} metalness={0.75} roughness={0.35} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function GlassOrb({
  position,
  scale,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
}) {
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshPhysicalMaterial
          color="#C7D2FE"
          transmission={0.92}
          thickness={1.1}
          roughness={0.12}
          ior={1.4}
          metalness={0}
          clearcoat={1}
        />
      </mesh>
    </Float>
  );
}

function TrustGem() {
  const ref = useRef<THREE.Mesh>(null);
  const reduced = usePrefersReducedMotion();

  useFrame((state) => {
    if (reduced || !ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.18;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1}>
      <mesh ref={ref} position={[1.85, 1.15, -0.6]} scale={0.62}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#6D5DFB"
          emissive="#4338CA"
          emissiveIntensity={0.35}
          metalness={0.65}
          roughness={0.2}
          flatShading
        />
      </mesh>
    </Float>
  );
}

function PointerTilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const reduced = usePrefersReducedMotion();

  useFrame((state, delta) => {
    if (reduced || !ref.current) return;
    const targetY = state.pointer.x * 0.28;
    const targetX = -state.pointer.y * 0.18;
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, targetY, 2.5, delta);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, targetX, 2.5, delta);
  });

  return <group ref={ref}>{children}</group>;
}

export default function HeroScene() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="h-full w-full" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={2.4} color="#FFFFFF" />
        <pointLight position={[-5, -2, -3]} intensity={42} color="#6D5DFB" />
        <pointLight position={[5, -3, 2]} intensity={26} color="#4F8CFF" />

        <PresentationControls
          global={false}
          snap={true}
          rotation={[0, 0, 0]}

          polar={[-0.35, 0.35]}
          azimuth={[-0.5, 0.5]}
          cursor
        >
          <PointerTilt>
            <group position={[0, -0.1, 0]}>
              <RupeeCoin />
              <TrustGem />
              {!reduced && (
                <>
                  <GlassOrb position={[-2.1, 1.35, -0.8]} scale={0.9} speed={1.2} />
                  <GlassOrb position={[2.2, -1.3, -1.1]} scale={0.65} speed={1.7} />
                  <GlassOrb position={[-1.7, -1.5, -0.4]} scale={0.45} speed={2.1} />
                  <Sparkles count={70} scale={[8.5, 5.5, 4]} size={2.4} speed={0.4} color="#A5B4FC" opacity={0.7} />
                </>
              )}
              {reduced && <GlassOrb position={[-2.1, 1.35, -0.8]} scale={0.9} speed={0} />}
            </group>
          </PointerTilt>
        </PresentationControls>

        <ContactShadows position={[0, -2.15, 0]} opacity={0.32} scale={10} blur={2.6} far={4} color="#312E81" />
      </Canvas>
    </div>
  );
}
