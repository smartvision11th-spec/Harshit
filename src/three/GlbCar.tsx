import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

/**
 * Optional: load your own optimised GLB (see README). The model is auto-scaled to ~4.5 units long,
 * centred and dropped onto the floor. Front should point along +X; rotate in your DCC tool if not.
 */
export default function GlbCar({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const scale = 4.5 / Math.max(size.x, size.z, 0.0001);
    clone.scale.setScalar(scale);
    const fitted = new THREE.Box3().setFromObject(clone);
    const center = fitted.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -fitted.min.y, -center.z);
    return clone;
  }, [scene]);

  return <primitive object={model} />;
}
