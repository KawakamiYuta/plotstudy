import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { frameStore } from "../stores/frameStore";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const HISTORY = 200;
const FFT_SIZE = 512;

export const Waterfall3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const historyRef = useRef<Float32Array[]>([]);

  const norm = (v: Float32Array) => {
    const out = new Float32Array(v.length);
    for (let i = 0; i < v.length; i++) {
      out[i] = Math.min(1, v[i] / 160);
    }
    return out;
  };

  // 🎨 落ち着いたカラーマップ（青〜グレー）
const colorMap = (v: number, z: number) => {
  const c = new THREE.Color();

  // 🎯 コントラスト強化
  const vv = Math.pow(v, 1.0);

  // 🌌 ダークブルー → シアン → 白
  c.setRGB(
    0.15 + vv * 0.5,
    0.2  + vv * 0.6,
    0.25 + vv * 0.7
  );

  // 奥行きフェード
  const depthFade = 1.0 - z / HISTORY;
  c.multiplyScalar(0.6 + depthFade * 0.4);

  // ピーク強調（重要）
  if (v > 0.8) {
    const boost = (v - 0.8) / 0.2;
    c.lerp(new THREE.Color(1, 1, 1), boost * 0.8);
  }

  return c;
};

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // =========================
    // Scene
    // =========================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f14);
    scene.fog = new THREE.Fog(0x0b0f14, 80, 220);

    // =========================
    // Camera
    // =========================
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 70, 90);
    camera.lookAt(0, 0, 0);

    // =========================
    // Renderer
    // =========================
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // =========================
    // Controls
    // =========================
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    // =========================
    // Light（重要：高級感の本体）
    // =========================
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(50, 100, 50);
    scene.add(dir);

    // =========================
    // Geometry
    // =========================
    const geometry = new THREE.PlaneGeometry(
      200,
      200,
      FFT_SIZE - 1,
      HISTORY - 1
    );
    geometry.rotateX(-Math.PI / 2);

    // =========================
    // Material（ここが核心）
    // =========================
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.6,
      metalness: 0.2,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    geometryRef.current = geometry;

    // =========================
    // Subtle Grid（控えめ）
    // =========================
    const grid = new THREE.GridHelper(200, 20, 0x223344, 0x111111);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    scene.add(grid);

    // =========================
    // Update Geometry
    // =========================
    const updateGeometry = () => {
      const geometry = geometryRef.current!;
      const history = historyRef.current;

      const pos = geometry.attributes.position;
      const colors: number[] = [];

      for (let z = 0; z < HISTORY; z++) {
        const row = history[z];
        if (!row) continue;

        for (let x = 0; x < row.length; x++) {
          const i = z * row.length + x;

          const v = row[x];

          // 高さも控えめに
          const y = v * 20;
          // const y = v;

          pos.setY(i, y);

          const c = colorMap(v, z);
          colors.push(c.r, c.g, c.b);
        }
      }

      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3)
      );

      pos.needsUpdate = true;
    };

    // =========================
    // Subscribe
    // =========================
    const unsub = frameStore.subscribe((frame) => {
      const data = norm(frame.spectrum as Float32Array);

      historyRef.current.unshift(data);
      if (historyRef.current.length > HISTORY) {
        historyRef.current.pop();
      }

      updateGeometry();
    });

    // =========================
    // Animation
    // =========================
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // =========================
    // Resize
    // =========================
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;

      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", onResize);

    return () => {
      unsub();
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};