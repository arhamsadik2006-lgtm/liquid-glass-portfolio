"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial, RoundedBox, useTexture } from "@react-three/drei";
import { DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Effect, EffectAttribute, type DepthOfFieldEffect } from "postprocessing";
import * as THREE from "three";
import { Uniform, Vector2 } from "three"; // <-- Explicitly imported
import type { Project } from "@/lib/projects";
import { scrollState } from "@/lib/scroll-store";
import { useUI } from "@/components/providers/UIProvider";
import { SafeCanvas } from "./SafeCanvas";

/* ------------------------------------------------------------------ */
/* Velocity-driven directional motion blur (custom postprocessing FX)  */
/* ------------------------------------------------------------------ */
const blurFrag = /* glsl */ `
uniform float strength;
uniform vec2 dir;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (strength < 0.0004) { outputColor = inputColor; return; }
  vec4 acc = vec4(0.0);
  float total = 0.0;
  for (int i = 0; i < 14; i++) {
    float t = float(i) / 13.0 - 0.5;
    float w = 1.0 - abs(t) * 1.2;
    acc += texture2D(inputBuffer, uv + dir * strength * t) * w;
    total += w;
  }
  outputColor = acc / total;
}`;

class DirectionalMotionBlur extends Effect {
  constructor() {
    super("DirectionalMotionBlur", blurFrag, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([
        ["strength", new Uniform(0)],
        ["dir", new Uniform(new Vector2(1, 0.25))],
      ]),
    });
  }
  set strength(v: number) {
    const u = this.uniforms.get("strength");
    if (u) u.value = v;
  }
}

/* ------------------------------------------------------------------ */
/* Card geometry constants                                             */
/* ------------------------------------------------------------------ */
const W = 1.6;
const H = 2.2;
const D = 0.14;
const PAD = 0.07;
const INNER_W = W - PAD * 2;
const INNER_H = H - PAD * 2;
const SCREEN_H = INNER_H * 0.75;
const FOOTER_H = INNER_H * 0.25 - 0.02;
const SCREEN_Y = H / 2 - PAD - SCREEN_H / 2;
const FOOTER_Y = -H / 2 + PAD + FOOTER_H / 2;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeFooterTexture(p: Project, total: number): THREE.CanvasTexture {
  const cw = 1024;
  const ch = Math.round((cw * FOOTER_H) / INNER_W);
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, "rgba(22,23,31,1)");
    g.addColorStop(1, "rgba(9,10,14,1)");
    ctx.fillStyle = g;
    roundRect(ctx, 0, 0, cw, ch, 36);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 4);
    ctx.lineTo(cw - 40, 4);
    ctx.stroke();

    const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    const sans = "Inter, 'Helvetica Neue', Arial, system-ui, sans-serif";
    ctx.textBaseline = "middle";

    ctx.fillStyle = p.accent;
    ctx.beginPath();
    ctx.arc(52, ch * 0.27, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `500 34px ${mono}`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.textAlign = "left";
    ctx.fillText(`#${String(p.index).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, 76, ch * 0.27);
    ctx.textAlign = "right";
    ctx.fillText(`⏱ ${p.runtime}`, cw - 44, ch * 0.27);

    ctx.textAlign = "left";
    ctx.font = `700 64px ${sans}`;
    ctx.fillStyle = "#ffffff";
    let client = p.client;
    while (ctx.measureText(client).width > cw * 0.56 && client.length > 4) client = client.slice(0, -2);
    if (client !== p.client) client += "…";
    ctx.fillText(client, 40, ch * 0.66);

    ctx.font = `600 28px ${mono}`;
    const tag = p.label;
    const tw = ctx.measureText(tag).width + 44;
    const tx = cw - 44 - tw;
    const ty = ch * 0.66 - 26;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, tx, ty, tw, 52, 26);
    ctx.fill();
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(tag, tx + tw / 2, ch * 0.66 + 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ------------------------------------------------------------------ */
/* Deck                                                                */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Deck                                                                */
/* ------------------------------------------------------------------ */
interface CardRuntime {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  scale: number;
}

function Deck({ projects, counterRef }: { projects: Project[]; counterRef: RefObject<HTMLSpanElement | null> }) {
  const { openProject, modal } = useUI();
  const camera = useThree((s) => s.camera);
  const n = projects.length;

  const urls = useMemo(() => Array.from(new Set(projects.map((p) => p.thumbnail))), [projects]);
  const loaded = useTexture(urls);
  const baseTextures = useMemo(() => {
    const m = new Map<string, THREE.Texture>();
    (Array.isArray(loaded) ? loaded : [loaded]).forEach((t, i) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      m.set(urls[i], t);
    });
    return m;
  }, [loaded, urls]);

  // per-card texture clones (share GPU source) for independent Ken-Burns pans
  const cardTextures = useMemo(
    () =>
      projects.map((p) => {
        const t = (baseTextures.get(p.thumbnail) as THREE.Texture).clone();
        t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
        t.needsUpdate = true;
        return t;
      }),
    [projects, baseTextures],
  );
  const footers = useMemo(() => projects.map((p) => makeFooterTexture(p, n)), [projects, n]);
  useEffect(
    () => () => {
      cardTextures.forEach((t) => t.dispose());
      footers.forEach((t) => t.dispose());
    },
    [cardTextures, footers],
  );

  const groups = useRef<(THREE.Group | null)[]>([]);
  const screenMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const runtime = useRef<CardRuntime[]>(
    projects.map(() => ({ pos: new THREE.Vector3(20, 0, 0), quat: new THREE.Quaternion(), scale: 1 })),
  );
  const root = useRef<THREE.Group>(null);
  const hovered = useRef<number | null>(null);
  const selected = useRef<number | null>(null);
  const lastCenter = useRef(-1);

  useEffect(() => {
    if (!modal) selected.current = null;
  }, [modal]);

  // scratch objects
  const tmp = useMemo(
    () => ({
      euler: new THREE.Euler(),
      q: new THREE.Quaternion(),
      qStart: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0.38, 0.22)),
      qMid: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.02, 0, 0)),
      qEnd: new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(1, 1, 0).normalize(), -0.85)
        .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -0.3, -0.25))),
      rootQ: new THREE.Quaternion(),
      target: new THREE.Vector3(),
      look: new THREE.Vector3(0, 0, 0),
      lookTarget: new THREE.Vector3(),
      camHome: new THREE.Vector3(0, 0, 8),
      world: new THREE.Vector3(),
      worldQ: new THREE.Quaternion(),
      offset: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const p = scrollState.deckProgress;
    const t = state.clock.elapsedTime;

    const a = smooth(0.0, 0.38, p); // sweep in
    const insp = smooth(0.3, 0.48, p) * (1 - smooth(0.64, 0.8, p)); // inspection fan-apart
    const c = smooth(0.62, 1.0, p); // diagonal S-curve cascade

    // root orientation: lower-left fan -> facing -> upper-right cascade
    tmp.rootQ.copy(tmp.qStart).slerp(tmp.qMid, smooth(0.28, 0.46, p)).slerp(tmp.qEnd, c);
    if (root.current) {
      root.current.quaternion.slerp(tmp.rootQ, 1 - Math.exp(-dt * 6));
      const rx = THREE.MathUtils.lerp(-0.9, 0, smooth(0.25, 0.46, p)) + c * 1.1;
      const ry = THREE.MathUtils.lerp(-0.6, 0, smooth(0.25, 0.46, p)) + c * 0.7;
      root.current.position.x += (rx - root.current.position.x) * (1 - Math.exp(-dt * 6));
      root.current.position.y += (ry - root.current.position.y) * (1 - Math.exp(-dt * 6));
    }

    const shift = THREE.MathUtils.lerp(n * 0.75, 0, a) - c * 4.5;
    const spacing = THREE.MathUtils.lerp(0.62, 1.08, insp);
    let centerIdx = 0;
    let centerDist = Infinity;

    for (let i = 0; i < n; i++) {
      const g = groups.current[i];
      if (!g) continue;
      const u = i - (n - 1) / 2 + shift;
      const au = Math.abs(u);
      if (au < centerDist) {
        centerDist = au;
        centerIdx = i;
      }

      // helical wave layout
      const extra = insp * Math.sign(u) * Math.min(au, 2.2) * 0.55;
      const wx = u * spacing + extra;
      
      // FIX 1: Remove "+ t * 0.15" so cards stay completely still when not scrolling
      const wy = Math.sin(u * 0.38) * 0.85 * (1 - insp * 0.8);
      const wz = (Math.cos(u * 0.42) - 1) * 2.1 * (1 - insp * 0.35) - au * 0.05;
      const wRotY = -Math.sin(u * 0.42) * 0.75 * (1 - insp * 0.55);
      const wRotZ = u * 0.035 * (1 - insp);
      const wRotX = Math.sin(u * 0.3) * 0.12 * (1 - insp);

      // cascading diagonal stack layout
      const cx = u * 0.42;
      const cy = -u * 0.36;
      const cz = -u * 0.55 - au * 0.08;

      tmp.target.set(
        THREE.MathUtils.lerp(wx, cx, c),
        THREE.MathUtils.lerp(wy, cy, c),
        THREE.MathUtils.lerp(wz, cz, c),
      );
      tmp.euler.set(
        THREE.MathUtils.lerp(wRotX, -0.1, c),
        THREE.MathUtils.lerp(wRotY, 0.35, c),
        THREE.MathUtils.lerp(wRotZ, 0.05, c),
      );

      // FIX 2: Reduce hover Z-pop and smooth it so raycasting never flickers on card edges
      const isHover = hovered.current === i;
      if (isHover) tmp.target.z += 0.18;
      tmp.q.setFromEuler(tmp.euler);

     // Inside Deck useFrame loop (around line 294 in src/components/three/DeckScene.tsx)
      if (!runtime.current[i]) {
        runtime.current[i] = {
          pos: tmp.target.clone(),
          quat: tmp.q.clone(),
          scale: 1,
        };
      }
      const rt = runtime.current[i];
      const k = 1 - Math.exp(-dt * 8);
      rt.pos.lerp(tmp.target, k);

      rt.quat.slerp(tmp.q, k);
      const targetScale = isHover ? 1.03 : 1;
      rt.scale += (targetScale - rt.scale) * k;
      
      g.position.copy(rt.pos);
      g.quaternion.copy(rt.quat);
      g.scale.setScalar(rt.scale);
      g.visible = au < 16;

      // FIX 3: Lock thumbnail aspect-ratio crop statically (remove t-based Ken-Burns shaking)
      const tex = cardTextures[i];
      const img = tex.image as { width?: number; height?: number } | undefined;
      const imgAspect = img?.width && img?.height ? img.width / img.height : 16 / 9;
      const planeAspect = INNER_W / SCREEN_H;
      const rx = Math.min(1, planeAspect / imgAspect);
      const ry = Math.min(1, imgAspect / planeAspect);
      tex.repeat.set(rx, ry);
      tex.offset.set((1 - rx) * 0.5, (1 - ry) * 0.5);

      const mat = screenMats.current[i];
      if (mat) {
        const focus = 1 - Math.min(1, au / 3.2) * (0.35 + insp * 0.4);
        mat.color.setScalar(isHover ? 1.15 : focus);
      }
    }

    // measure real camera->center-card distance for rack focus
    const cg = groups.current[selected.current ?? centerIdx];
    if (cg) {
      cg.getWorldPosition(tmp.world);
      scrollState.focusDistance = tmp.world.distanceTo(camera.position);
    }

    if (counterRef.current && centerIdx !== lastCenter.current) {
      lastCenter.current = centerIdx;
      const pr = projects[centerIdx];
      counterRef.current.textContent = `${String(pr.index).padStart(2, "0")} / ${String(n).padStart(2, "0")} — ${pr.client}`;
    }

    // camera: fly into the selected card, else idle drift
    const sel = selected.current;
    if (sel !== null && groups.current[sel]) {
      const g = groups.current[sel] as THREE.Group;
      g.getWorldPosition(tmp.world);
      g.getWorldQuaternion(tmp.worldQ);
      tmp.offset.set(0, 0.15, 2.3).applyQuaternion(tmp.worldQ);
      tmp.target.copy(tmp.world).add(tmp.offset);
      tmp.lookTarget.copy(tmp.world);
      const k = 1 - Math.exp(-dt * 4.5);
      camera.position.lerp(tmp.target, k);
      tmp.look.lerp(tmp.lookTarget, k);
    } else {
      tmp.target.set(state.pointer.x * 0.35, state.pointer.y * 0.25, 8);
      const k = 1 - Math.exp(-dt * 3);
      camera.position.lerp(tmp.target, k);
      tmp.look.lerp(tmp.camHome.set(0, 0, 0), k);
      tmp.camHome.set(0, 0, 8);
    }
    camera.lookAt(tmp.look);
  });

  const onOver = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = i;
    document.body.style.cursor = "pointer";
  };
  const onOut = (i: number) => () => {
    if (hovered.current === i) hovered.current = null;
    document.body.style.cursor = "";
  };
  const onClick = (i: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (selected.current !== null) return;
    selected.current = i;
    document.body.style.cursor = "";
    window.setTimeout(() => openProject(projects[i].slug), 650);
  };

  return (
    <group ref={root}>
      {projects.map((p, i) => (
        <group
          key={p.slug}
          ref={(el) => {
            groups.current[i] = el;
          }}
          position={[20, 0, 0]}
        >
          {/* thick acrylic slab */}
          <RoundedBox
            args={[W, H, D]}
            radius={0.09}
            smoothness={4}
            onPointerOver={onOver(i)}
            onPointerOut={onOut(i)}
            onClick={onClick(i)}
          >
            <MeshTransmissionMaterial
              transmissionSampler
              thickness={0.35}
              roughness={0.03}
              ior={1.42}
              chromaticAberration={0.3}
              anisotropicBlur={0.04}
              distortion={0.06}
              distortionScale={0.3}
              temporalDistortion={0}
              clearcoat={1}
              clearcoatRoughness={0.08}
              envMapIntensity={1.4}
              color="#f4f6ff"
              attenuationColor="#dfe6ff"
              attenuationDistance={2.5}
            />
          </RoundedBox>
          {/* internal frosted backing */}
          <mesh position={[0, 0, -D * 0.32]}>
            <planeGeometry args={[INNER_W + 0.04, INNER_H + 0.04]} />
            <meshStandardMaterial color="#1a1c25" roughness={0.95} metalness={0} />
          </mesh>
          {/* embedded video/thumbnail plane (upper 75%) */}
          <mesh position={[0, SCREEN_Y, -D * 0.05]}>
            <planeGeometry args={[INNER_W, SCREEN_H]} />
            <meshBasicMaterial
              ref={(m) => {
                screenMats.current[i] = m;
              }}
              map={cardTextures[i]}
              toneMapped={false}
            />
          </mesh>
          {/* metadata footer strip (bottom 25%) — printed on the front face for legibility */}
          <mesh position={[0, FOOTER_Y, D / 2 + 0.003]}>
            <planeGeometry args={[INNER_W, FOOTER_H]} />
            <meshBasicMaterial map={footers[i]} toneMapped={false} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Effects() {
  const dof = useRef<DepthOfFieldEffect>(null);
  const blur = useMemo(() => new DirectionalMotionBlur(), []);
  useEffect(() => () => blur.dispose(), [blur]);

  useFrame((_, dt) => {
    const v = Math.min(1, Math.abs(scrollState.smoothVelocity) / 45);
    const p = scrollState.deckProgress;
    const insp = smooth(0.3, 0.48, p) * (1 - smooth(0.64, 0.8, p));
    blur.strength = Math.max(0, v - 0.1) * 0.026;
    const d = dof.current;
    if (d) {
      const k = 1 - Math.exp(-dt * 5);
      // slow = deep, crisp focus on the featured card; fast = shallow bokeh
      const targetBokeh = THREE.MathUtils.lerp(1.6, 6.5, v) * (1 - insp * 0.3);
      d.bokehScale += (targetBokeh - d.bokehScale) * k;
      const coc = d.cocMaterial;
      const targetRange = THREE.MathUtils.lerp(5.5, 1.2, v) + insp * 1.5;
      coc.focusRange += (targetRange - coc.focusRange) * k;
      coc.focusDistance += (scrollState.focusDistance - coc.focusDistance) * (1 - Math.exp(-dt * 8));
    }
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <DepthOfField ref={dof} focusDistance={8} focusRange={5.5} bokehScale={1.6} resolutionScale={0.5} />
      <primitive object={blur} dispose={null} />
      <Vignette offset={0.25} darkness={0.75} />
    </EffectComposer>
  );
}

export default function DeckScene({
  projects,
  activeRef,
  counterRef,
  fallback,
}: {
  projects: Project[];
  activeRef: RefObject<boolean>;
  counterRef: RefObject<HTMLSpanElement | null>;
  fallback: React.ReactNode;
}) {
  return (
    <SafeCanvas
      activeRef={activeRef}
      fallback={fallback}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], fov: 40, near: 0.1, far: 60 }}
      gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#000000");
        scene.background = new THREE.Color("#000000");
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[-6, 5, 6]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[6, -3, 4]} intensity={1.2} color="#a78bfa" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={6} position={[0, 5, 3]} scale={[12, 0.6, 1]} />
        <Lightformer form="rect" intensity={4} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 0.5, 1]} />
        <Lightformer form="rect" intensity={3} color="#c4b5fd" position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 0.5, 1]} />
        <Lightformer form="ring" intensity={2.5} color="#67e8f9" position={[0, -4, 5]} scale={3} />
      </Environment>
      <Suspense fallback={null}>
        <Deck projects={projects} counterRef={counterRef} />
        <Effects />
      </Suspense>
    </SafeCanvas>
  );
}