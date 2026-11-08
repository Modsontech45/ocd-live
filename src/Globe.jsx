import React, { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { CITIES, LOME } from './data.js';

const D = Math.PI / 180;

// Togo border polygon [lon, lat]
const TOGO = [
  [0.09,10.99],[0.37,11.08],[0.78,10.93],[1.07,10.84],[1.37,10.47],
  [1.46,9.56],[1.63,9.13],[1.67,8.20],[1.78,7.57],[1.60,7.14],
  [1.17,6.93],[0.63,6.42],[0.00,6.50],[-0.05,7.0],[0.00,8.0],
  [0.00,9.0],[0.00,10.0],[0.09,10.99],
];

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

// Dense grid of gold dots inside Togo's borders
function TogoDots() {
  const geo = useMemo(() => {
    const pts = [];
    const steps = 120;
    const LON0 = -0.1, LON1 = 1.9, LAT0 = 6.0, LAT1 = 11.2;
    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps; j++) {
        const lon = LON0 + (LON1 - LON0) * (i / steps);
        const lat = LAT0 + (LAT1 - LAT0) * (j / steps);
        if (!inPoly(lon, lat, TOGO)) continue;
        const r = 1.006;
        const phi = (90 - lat) * D, th = (lon + 180) * D;
        pts.push(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
      }
    }
    const b = new THREE.BufferGeometry();
    b.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return b;
  }, []);
  return <points geometry={geo}><pointsMaterial color="#c9a84c" size={0.016} sizeAttenuation /></points>;
}

// Procedural cloud texture via noise — no CDN dependency
function makeCloudTex() {
  const W = 1024, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;

  function h2(x, y) {
    const n = Math.sin(x * 92.837 + y * 68.928) * 43758.5453;
    return n - Math.floor(n);
  }
  function sn(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    return h2(ix,iy)*(1-ux)*(1-uy) + h2(ix+1,iy)*ux*(1-uy) + h2(ix,iy+1)*(1-ux)*uy + h2(ix+1,iy+1)*ux*uy;
  }
  function fbm(x, y) {
    return sn(x,y)*0.5 + sn(x*2.1,y*2.1)*0.25 + sn(x*4.3,y*4.3)*0.125 + sn(x*8.6,y*8.6)*0.0625;
  }

  const img = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = fbm(x / W * 7 + 3.5, y / H * 3.5 + 2.1);
      const a = Math.max(0, Math.min(1, (v - 0.48) * 7));
      const k = (y * W + x) * 4;
      img[k] = img[k+1] = img[k+2] = 255;
      img[k+3] = Math.round(a * 230);
    }
  }
  canvas.getContext('2d').putImageData(new ImageData(img, W, H), 0, 0);
  return new THREE.CanvasTexture(canvas);
}

function Clouds() {
  const ref = useRef();
  const texture = useMemo(makeCloudTex, []);
  useFrame(({ clock }) => { ref.current.rotation.y = clock.elapsedTime * 0.028; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.025, 48, 32]} />
      <meshStandardMaterial map={texture} transparent opacity={0.65} depthWrite={false} />
    </mesh>
  );
}

// Blue atmosphere glow around the globe
function Atmosphere() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[1.1, 32, 24]} />
        <meshStandardMaterial color="#3a7fff" transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.015, 32, 24]} />
        <meshStandardMaterial color="#88aaff" transparent opacity={0.03} side={THREE.FrontSide} />
      </mesh>
    </>
  );
}

// Real Earth texture loaded from CDN
function TexturedEarth() {
  const map = useLoader(THREE.TextureLoader,
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg');
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 48]} />
      <meshStandardMaterial map={map} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

// Shown while the Earth texture is loading
function FallbackEarth() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 48]} />
      <meshStandardMaterial color="#1b4d7a" emissive="#0a2234" emissiveIntensity={0.35} roughness={0.9} />
    </mesh>
  );
}

// Error boundary so a CDN failure doesn't crash the globe
class TexEB extends React.Component {
  constructor(p) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? <FallbackEarth /> : this.props.children; }
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
      <Atmosphere />
      <TexEB>
        <Suspense fallback={<FallbackEarth />}>
          <TexturedEarth />
        </Suspense>
      </TexEB>
      <Clouds />
      <TogoDots />
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
      aria-label="Globe 3D : les lives partent du studio de Lomé vers toute l'Afrique"
      role="img"
    >
      <Canvas camera={{ position: [0, 0, 3.1], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 3, 5]} intensity={1.3} />
        <World drag={drag} />
      </Canvas>
    </div>
  );
}
