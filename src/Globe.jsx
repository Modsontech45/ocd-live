import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AFRICA, MADAGASCAR, CITIES, LOME } from './data.js';

const D = Math.PI / 180;
const ORANGE = new THREE.Color('#c9a84c');

function ll(lat, lon, r = 1) {
  const phi = (90 - lat) * D, th = (lon + 180) * D;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}
function inPoly(lon, lat, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function AfricaDots() {
  const geo = useMemo(() => {
    const pts = [], N = 26000, g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = g * i;
      const v = new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r);
      const lat = Math.asin(v.y) / D;
      const lon = Math.atan2(v.z, -v.x) / D - 180;
      const L = ((lon + 540) % 360) - 180;
      if (inPoly(L, lat, AFRICA) || inPoly(L, lat, MADAGASCAR)) pts.push(v.x * 1.003, v.y * 1.003, v.z * 1.003);
    }
    const b = new THREE.BufferGeometry();
    b.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return b;
  }, []);
  return <points geometry={geo}><pointsMaterial color={ORANGE} size={0.018} sizeAttenuation /></points>;
}

function Arc({ to, i }) {
  const { curve, tube } = useMemo(() => {
    const a = ll(LOME.lat, LOME.lon, 1.005), b = ll(to.lat, to.lon, 1.005);
    const lift = 1 + a.distanceTo(b) * 0.45;
    const mid = a.clone().add(b).normalize().multiplyScalar(lift);
    const c = new THREE.QuadraticBezierCurve3(a, mid, b);
    return { curve: c, tube: new THREE.TubeGeometry(c, 48, 0.0035, 6, false) };
  }, [to]);
  const dot = useRef();
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.35 + i * 0.37) % 1;
    dot.current.position.copy(curve.getPoint(t));
    dot.current.scale.setScalar(0.6 + Math.sin(t * Math.PI) * 0.8);
  });
  const end = useMemo(() => ll(to.lat, to.lon, 1.006), [to]);
  return (
    <group>
      <mesh geometry={tube}><meshBasicMaterial color="#c9a84c" transparent opacity={0.55} /></mesh>
      <mesh ref={dot}><sphereGeometry args={[0.012, 12, 8]} /><meshBasicMaterial color="#f0ede8" /></mesh>
      <mesh position={end}><sphereGeometry args={[0.009, 10, 8]} /><meshBasicMaterial color="#f0ede8" /></mesh>
    </group>
  );
}

function Studio() {
  const p = useMemo(() => ll(LOME.lat, LOME.lon, 1.01), []);
  const rings = useRef([]);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize()), [p]);
  useFrame(({ clock }) => rings.current.forEach((r, i) => {
    if (!r) return;
    const t = (clock.elapsedTime * 0.6 + i / 3) % 1;
    r.scale.setScalar(0.4 + t * 2.4); r.material.opacity = 1 - t;
  }));
  return (
    <group position={p} quaternion={q}>
      <mesh><sphereGeometry args={[0.024, 16, 12]} /><meshBasicMaterial color="#c9a84c" /></mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (rings.current[i] = el)}>
          <ringGeometry args={[0.03, 0.036, 40]} /><meshBasicMaterial color="#c9a84c" transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function World({ drag }) {
  const g = useRef();
  const base = -(15 + 90) * D;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const target = base + Math.sin(t * 0.25) * 0.35 + drag.current.x;
    g.current.rotation.y += (target - g.current.rotation.y) * 0.06;
    g.current.rotation.x += (0.12 + drag.current.y - g.current.rotation.x) * 0.06;
  });
  return (
    <group ref={g}>
      <mesh><sphereGeometry args={[1, 64, 48]} /><meshStandardMaterial color="#0f0f0f" emissive="#c9a84c" emissiveIntensity={0.08} roughness={0.95} /></mesh>
      <mesh><sphereGeometry args={[1.001, 36, 18]} /><meshBasicMaterial color="#2a2a2a" wireframe transparent opacity={0.35} /></mesh>
      <AfricaDots />
      {CITIES.map((c, i) => <Arc key={c.name} to={c} i={i} />)}
      <Studio />
    </group>
  );
}

export default function Globe({ className }) {
  const drag = useRef({ x: 0, y: 0 });
  const last = useRef(null);
  return (
    <div
      className={className}
      onPointerDown={(e) => { last.current = [e.clientX, e.clientY]; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => {
        if (!last.current) return;
        drag.current.x += (e.clientX - last.current[0]) * 0.006;
        drag.current.y = Math.max(-0.6, Math.min(0.6, drag.current.y + (e.clientY - last.current[1]) * 0.004));
        last.current = [e.clientX, e.clientY];
      }}
      onPointerUp={() => { last.current = null; }}
      aria-label="Globe 3D : les lives partent du studio de Lomé vers toute l’Afrique"
      role="img"
    >
      <Canvas camera={{ position: [0, 0, 3.1], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[2, 3, 4]} intensity={1.1} />
        <World drag={drag} />
      </Canvas>
    </div>
  );
}
