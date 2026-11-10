import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import ProceduralCar from './ProceduralCar';
import GlbCar from './GlbCar';
import type { SceneInputRef } from './sceneInput';
import { SITE } from '../config/site';

export type CarSceneProps = {
  inputRef: SceneInputRef;
  variant: 'hero' | 'showcase';
  quality: 'high' | 'low';
  /** When false the render loop is paused (off-screen). */
  active: boolean;
  onReady?: () => void;
  onFail?: () => void;
};

/** Piecewise smooth interpolation through keyframes. */
function sample(p: number, keys: number[], vals: number[]): number {
  if (p <= keys[0]) return vals[0];
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i]) {
      const t = (p - keys[i - 1]) / (keys[i] - keys[i - 1]);
      const s = t * t * (3 - 2 * t);
      return vals[i - 1] + (vals[i] - vals[i - 1]) * s;
    }
  }
  return vals[vals.length - 1];
}

function ReadySignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    frames.current += 1;
    if (frames.current > 3) {
      done.current = true;
      onReady?.();
    }
  });
  return null;
}

function CarRig({ inputRef, variant }: Pick<CarSceneProps, 'inputRef' | 'variant'>) {
  const group = useRef<THREE.Group>(null);
  const cur = useRef({ yaw: variant === 'hero' ? -0.6 : 0.15, camX: 0, camY: 1.5, dist: 9, shiftX: 0 });

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const input = inputRef.current;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-delta * 3.2);
    const camera = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / state.size.height;
    const halfFov = (camera.fov * Math.PI) / 360;

    let targetYaw: number;
    let height = 1.45;
    let fitWidth = 5.6;
    let shiftX = 0;

    if (variant === 'hero') {
      targetYaw = -0.62 + Math.sin(t * 0.28) * 0.14 + input.mx * 0.42;
      shiftX = aspect > 1.2 ? 0.9 : 0;
    } else {
      const p = input.progress;
      targetYaw = sample(p, [0, 0.45, 1], [0.12, -0.95, -2.55]);
      height = sample(p, [0, 0.5, 1], [1.2, 1.9, 1.35]);
      fitWidth = sample(p, [0, 0.5, 1], [5.4, 5.0, 5.4]);
    }

    // Distance needed so the car's width fits the viewport on narrow screens.
    const dist = Math.max(variant === 'hero' ? 8.2 : 7.6, fitWidth / aspect / (2 * Math.tan(halfFov)));

    const c = cur.current;
    c.yaw += (targetYaw - c.yaw) * k;
    c.camX += ((variant === 'hero' ? input.mx * 0.55 : 0) - c.camX) * k;
    c.camY += (height - (variant === 'hero' ? input.my * 0.28 : 0) - c.camY) * k;
    c.dist += (dist - c.dist) * k;
    c.shiftX += (shiftX - c.shiftX) * k;

    g.rotation.y = c.yaw;
    g.position.x = c.shiftX;
    camera.position.set(c.camX, c.camY, c.dist);
    camera.lookAt(c.shiftX * 0.6, 0.62, 0);
  });

  return (
    <group ref={group}>
      {SITE.carModelUrl ? (
        <Suspense fallback={<ProceduralCar />}>
          <GlbCar url={SITE.carModelUrl} />
        </Suspense>
      ) : (
        <ProceduralCar />
      )}
    </group>
  );
}

function Lights({ quality }: { quality: 'high' | 'low' }) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={0.9} color="#fff4ea" />
      <Environment resolution={quality === 'low' ? 128 : 256}>
        <color attach="background" args={['#050608']} />
        {/* overhead softbox */}
        <Lightformer form="rect" intensity={3.5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 8, 1]} />
        {/* long strip lights along each side */}
        <Lightformer form="rect" intensity={5} position={[-7, 1.6, -1]} rotation-y={Math.PI / 2} scale={[9, 1.1, 1]} />
        <Lightformer form="rect" intensity={3} position={[7, 2.2, 2]} rotation-y={-Math.PI / 2} scale={[8, 0.9, 1]} />
        {/* rim light in the brand accent colour */}
        <Lightformer form="rect" intensity={4} color="#ff5a1f" position={[0, 1.4, -8]} scale={[9, 0.7, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#c7cbd1" position={[5, 4, -6]} scale={3} />
      </Environment>
    </>
  );
}

export default function CarScene({ inputRef, variant, quality, active, onReady, onFail }: CarSceneProps) {
  const [dpr, setDpr] = useState<number>(quality === 'low' ? 1.25 : 1.75);

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={dpr}
      camera={{ fov: 32, near: 0.1, far: 60, position: [0, 1.5, 9] }}
      gl={{
        antialias: quality === 'high',
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onFail?.();
        });
      }}
      aria-hidden="true"
      style={{ touchAction: 'pan-y' }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Suspense fallback={null}>
        <Lights quality={quality} />
        <CarRig inputRef={inputRef} variant={variant} />
        <ContactShadows
          position={[0, 0.002, 0]}
          opacity={0.8}
          scale={13}
          blur={2.6}
          far={2.2}
          resolution={quality === 'low' ? 256 : 512}
          color="#000000"
        />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
