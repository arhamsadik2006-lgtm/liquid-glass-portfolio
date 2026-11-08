"use client";

import React, { useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { Color, OctahedronGeometry, type Group, type Mesh } from "three";
import { SafeCanvas } from "./SafeCanvas";

function CinemaLens() {
  const g = useRef<Group>(null);

  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    // Tie rotation to absolute elapsed time rather than accumulating delta to prevent shaking
    g.current.rotation.y = t * 0.35;
    g.current.rotation.x = 0.35 + Math.sin(t * 0.6) * 0.12;
  });

  return (
    <group ref={g} rotation={[0.35, 0.6, 0.2]}>
      {/* barrel */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.62, 0.7, 1.1, 64, 1, true]} />
        <meshStandardMaterial color="#14151b" metalness={0.9} roughness={0.32} side={2} />
      </mesh>

      {/* knurled focus rings */}
      {[-0.32, 0.02, 0.3].map((z, i) => (
        <mesh key={z} position={[0, 0, z]}>
          <torusGeometry args={[i === 1 ? 0.71 : 0.68, 0.05, 16, 96]} />
          <meshStandardMaterial
            color={i === 2 ? "#e11d48" : "#2b2d36"}
            emissive={i === 2 ? "#e11d48" : "#000"}
            emissiveIntensity={i === 2 ? 0.6 : 0}
            metalness={0.8}
            roughness={0.35}
          />
        </mesh>
      ))}

      {/* front glass element */}
      <mesh position={[0, 0, 0.56]} scale={[1, 1, 0.38]}>
        <sphereGeometry args={[0.6, 64, 32]} />
        <MeshTransmissionMaterial
          samples={4}
          resolution={256}
          thickness={0.6}
          roughness={0.04}
          chromaticAberration={0.8}
          anisotropicBlur={0.2}
          distortion={0.25}
          distortionScale={0.4}
          temporalDistortion={0.1}
          ior={1.5}
          color="#c4b5fd"
          backside
        />
      </mesh>

      {/* inner aperture glow */}
      <mesh position={[0, 0, 0.3]}>
        <circleGeometry args={[0.42, 48]} />
        <meshBasicMaterial color="#7c3aed" toneMapped={false} />
      </mesh>
    </group>
  );
}

function KeyframePrism() {
  const prismBg = useMemo(() => new Color("#3b2a7a"), []);
  const edgeGeo = useMemo(() => new OctahedronGeometry(0.855, 0), []);
  const outer = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outer.current) {
      outer.current.rotation.y = t * 0.5;
      outer.current.rotation.z = Math.PI / 4 + Math.sin(t) * 0.08;
    }
    if (inner.current) {
      const s = 1 + Math.sin(t * 2.4) * 0.12;
      inner.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <mesh ref={outer} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.85, 0]} />
        <MeshTransmissionMaterial
          samples={4}
          resolution={256}
          thickness={0.5}
          roughness={0.05}
          chromaticAberration={0.8}
          ior={1.35}
          distortion={0.1}
          color="#cffafe"
          background={prismBg}
        />
        <lineSegments>
          <edgesGeometry args={[edgeGeo]} />
          <lineBasicMaterial color="#67e8f9" toneMapped={false} transparent opacity={0.9} />
        </lineSegments>
      </mesh>
      <mesh ref={inner}>
        <octahedronGeometry args={[0.26, 0]} />
        <meshBasicMaterial color="#22d3ee" toneMapped={false} />
      </mesh>
      <pointLight color="#22d3ee" intensity={6} distance={4} />
    </group>
  );
}

function Rig() {
  const { viewport } = useThree();
  const x = Math.min(viewport.width * 0.36, 5.4);
  const y = viewport.height * 0.08;
  const s = viewport.width < 6 ? 0.55 : 1;

  return (
    <>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
        <group position={[-x, y, 0]} scale={s}>
          <CinemaLens />
        </group>
      </Float>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <group position={[x, y, 0]} scale={s}>
          <KeyframePrism />
        </group>
      </Float>
    </>
  );
}

export default function HeroAccents({ activeRef }: { activeRef: RefObject<boolean> }) {
  return (
    <SafeCanvas
      activeRef={activeRef}
      fallback={null}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <Environment resolution={128}>
        <Lightformer intensity={3} position={[0, 4, 4]} scale={[8, 1, 1]} />
        <Lightformer intensity={2} color="#a78bfa" position={[-5, 0, 2]} scale={[1, 6, 1]} />
        <Lightformer intensity={2} color="#22d3ee" position={[5, 0, 2]} scale={[1, 6, 1]} />
        <Lightformer intensity={1.5} position={[0, -3, -4]} scale={[10, 2, 1]} />
      </Environment>
      <Rig />
    </SafeCanvas>
  );
}