import { useMemo } from 'react';
import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * A stylised low-poly-free sports coupe built from extruded profiles, so the site ships with
 * zero external 3D assets. Length ~4.5 units, front of the car points along +X.
 * To use a real model instead, set SITE.carModelUrl in src/config/site.ts.
 */

const smoothCrease = Math.PI / 4;

function extrudeProfile(shape: THREE.Shape, depth: number, bevel: number): THREE.ExtrudeGeometry {
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 40,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: 10,
  });
}

function buildBody(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(-2.15, 0.28);
  s.lineTo(-2.2, 0.58);
  s.bezierCurveTo(-2.2, 0.74, -2.0, 0.84, -1.75, 0.88);
  s.bezierCurveTo(-1.4, 0.92, -0.9, 0.93, -0.4, 0.93);
  s.bezierCurveTo(0.2, 0.93, 0.8, 0.86, 1.3, 0.74);
  s.bezierCurveTo(1.8, 0.64, 2.1, 0.58, 2.22, 0.5);
  s.lineTo(2.24, 0.38);
  s.bezierCurveTo(2.2, 0.3, 2.1, 0.28, 1.95, 0.28);
  s.lineTo(-2.15, 0.28);

  const depth = 1.3;
  const bevel = 0.22;
  const geo = extrudeProfile(s, depth, bevel);
  geo.translate(0, 0.1, -depth / 2);

  // Taper the width: tumblehome toward the roofline, narrower nose and tail.
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const h = THREE.MathUtils.clamp((y - 0.7) / 0.5, 0, 1);
    const e = Math.min(Math.abs(x) / 2.3, 1);
    pos.setZ(i, z * (1 - 0.2 * h * h) * (1 - 0.22 * e * e * e));
  }
  pos.needsUpdate = true;

  const out = toCreasedNormals(geo, smoothCrease);
  geo.dispose();
  return out;
}

function buildGreenhouse(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(-1.3, 0.9);
  s.bezierCurveTo(-1.1, 1.12, -0.8, 1.29, -0.35, 1.31);
  s.bezierCurveTo(0.0, 1.32, 0.2, 1.28, 0.45, 1.15);
  s.bezierCurveTo(0.6, 1.07, 0.75, 0.98, 0.9, 0.9);
  s.lineTo(-1.3, 0.9);

  const depth = 0.9;
  const bevel = 0.22;
  const geo = extrudeProfile(s, depth, bevel);
  geo.translate(0, 0.07, -depth / 2);

  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const h = THREE.MathUtils.clamp((y - 0.97) / 0.4, 0, 1);
    const e = THREE.MathUtils.clamp(Math.abs(x + 0.2) / 1.1, 0, 1);
    pos.setZ(i, z * (1 - 0.34 * h) * (1 - 0.18 * e * e));
  }
  pos.needsUpdate = true;

  const out = toCreasedNormals(geo, smoothCrease);
  geo.dispose();
  return out;
}

function Wheel({ x, z }: { x: number; z: number }) {
  const spokes = useMemo(() => [0, 1, 2, 3, 4], []);
  return (
    <group position={[x, 0.38, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.27, 40]} />
        <meshStandardMaterial color="#0b0c0e" roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.285, 0.285, 0.282, 40]} />
        <meshStandardMaterial color="#9aa0a8" roughness={0.25} metalness={1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.286, 32]} />
        <meshStandardMaterial color="#14161a" roughness={0.6} metalness={0.6} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[0, 0, side * 0.141]}>
          {spokes.map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 5]}>
              <boxGeometry args={[0.56, 0.05, 0.012]} />
              <meshStandardMaterial color="#c7cbd1" roughness={0.25} metalness={1} />
            </mesh>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
            <meshStandardMaterial color="#ff5a1f" roughness={0.4} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

type Props = { paint?: string };

export default function ProceduralCar({ paint = '#3b414c' }: Props) {
  const body = useMemo(buildBody, []);
  const greenhouse = useMemo(buildGreenhouse, []);

  const paintProps = {
    color: paint,
    metalness: 0.9,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.35,
  } as const;

  return (
    <group>
      <mesh geometry={body}>
        <meshPhysicalMaterial {...paintProps} />
      </mesh>

      <mesh geometry={greenhouse}>
        <meshPhysicalMaterial color="#05070a" metalness={0.95} roughness={0.08} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.6} />
      </mesh>

      {/* wheel wells */}
      {[1.38, -1.4].flatMap((x) =>
        [-1, 1].map((side) => (
          <mesh key={`well-${x}-${side}`} position={[x, 0.4, side * 0.86]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.47, 0.47, 0.02, 40]} />
            <meshBasicMaterial color="#020203" />
          </mesh>
        )),
      )}

      {[1.38, -1.4].flatMap((x) => [-1, 1].map((side) => <Wheel key={`wheel-${x}-${side}`} x={x} z={side * 0.8} />))}

      {/* headlights */}
      {[-1, 1].map((side) => (
        <mesh key={`hl-${side}`} position={[2.1, 0.66, side * 0.5]} rotation={[0, side * 0.25, -0.38]}>
          <boxGeometry args={[0.16, 0.045, 0.34]} />
          <meshStandardMaterial color="#ffffff" emissive="#e6eeff" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}

      {/* tail light bar */}
      <mesh position={[-2.19, 0.82, 0]}>
        <boxGeometry args={[0.05, 0.06, 1.0]} />
        <meshStandardMaterial color="#ff2a10" emissive="#ff2a10" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>

      {/* ember sill accent */}
      {[-1, 1].map((side) => (
        <mesh key={`sill-${side}`} position={[0, 0.36, side * 0.872]}>
          <boxGeometry args={[1.7, 0.014, 0.012]} />
          <meshStandardMaterial color="#ff5a1f" emissive="#ff5a1f" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}

      {/* aero */}
      <mesh position={[2.08, 0.36, 0]}>
        <boxGeometry args={[0.5, 0.04, 1.5]} />
        <meshStandardMaterial color="#0a0b0d" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[-2.0, 0.4, 0]}>
        <boxGeometry args={[0.5, 0.05, 1.25]} />
        <meshStandardMaterial color="#0a0b0d" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[-2.03, 0.95, 0]} rotation={[0, 0, 0.14]}>
        <boxGeometry args={[0.42, 0.03, 1.2]} />
        <meshPhysicalMaterial {...paintProps} />
      </mesh>

      {/* mirrors */}
      {[-1, 1].map((side) => (
        <mesh key={`mirror-${side}`} position={[0.5, 1.02, side * 0.8]}>
          <boxGeometry args={[0.16, 0.07, 0.11]} />
          <meshPhysicalMaterial {...paintProps} />
        </mesh>
      ))}
    </group>
  );
}
