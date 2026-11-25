"use client";

import { RiceRating } from "./RiceRating";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { FeedbackItem, Locale } from "@/lib/types";

interface Props {
  items: FeedbackItem[];
  selectedId: string | null;
  locale: Locale;
  onSelect: (id: string) => void;
}

export function FeedbackFieldScene({ items, selectedId, locale, onSelect }: Props) {
  const previousIds = useRef(new Set(items.map(item => item.id)));
  const story = items.find(item => item.id === selectedId);
  const active = useRef(selectedId);
  useEffect(() => { active.current = selectedId; }, [selectedId]);
  const hostRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setUnavailable(true);
      return;
    }

    setUnavailable(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    renderer.setClearColor(0, 0);
    scene.fog = new THREE.Fog("#24190f", 23, 42);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(7.5, 13.5, 19);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.minPolarAngle = 0.32;
    controls.maxPolarAngle = 1.35;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight("#fff1d6", 1.55));
    const sun = new THREE.DirectionalLight("#ffcc83", 2.5);
    sun.position.set(-6, 12, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -11;
    sun.shadow.camera.right = 11;
    sun.shadow.camera.top = 11;
    sun.shadow.camera.bottom = -11;
    scene.add(sun);

    const soil = new THREE.TextureLoader().load("/brand/field-soil.jpg");
    soil.colorSpace = THREE.SRGBColorSpace;
    soil.wrapS = soil.wrapT = THREE.RepeatWrapping;
    soil.repeat.set(4, 4);
    soil.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(17, 96),
      new THREE.MeshPhysicalMaterial({ map: soil, bumpMap: soil, bumpScale: 0.018, roughness: 1, specularIntensity: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const knownIds = previousIds.current;
    previousIds.current = new Set(items.map(item => item.id));
    const arrivals: THREE.Mesh[] = [];
    const markers = new Map<string, THREE.Mesh>();
    const raycastTargets: THREE.Mesh[] = [];
    const grainMaterial = new THREE.MeshStandardMaterial({ color: "#f5bb60", roughness: 0.65 });

      const columns = Math.max(1, Math.ceil(Math.sqrt(items.length * 1.45)));
      const rows = Math.max(1, Math.ceil(items.length / columns));
      const spacing = Math.min(1.5, 12 / columns, 8 / rows);
      const radius = Math.min(0.32, spacing * 0.29);
      // A feathered stain lets the surrounding soil texture show through.
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;
      const context = canvas.getContext("2d")!;
      for (let i = 0; i < 12; i++) {
        const angle = i * 2.4;
        const x = 64 + 17 * Math.cos(angle);
        const y = 64 + 14 * Math.sin(angle);
        const shade = context.createRadialGradient(x, y, 3, x, y, 30 + (i % 4) * 4);
        shade.addColorStop(0, "rgba(43,23,14,.22)");
        shade.addColorStop(1, "rgba(43,23,14,0)");
        context.fillStyle = shade;
        context.fillRect(0, 0, 128, 128);
      }
      const stain = new THREE.CanvasTexture(canvas);
      stain.colorSpace = THREE.SRGBColorSpace;
      const patches = new THREE.InstancedMesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: stain, transparent: true, depthWrite: false }),
        items.length
      );
      scene.add(patches);
      const patch = new THREE.Object3D();
      items.forEach((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const px = (col - (columns - 1) / 2) * spacing;
        const pz = (row - (rows - 1) / 2) * spacing;
        patch.position.set(px, 0.002, pz);
        patch.rotation.set(-Math.PI / 2, 0, index * 2.4);
        patch.scale.set(radius * 6, radius * 4.5, 1);
        patch.updateMatrix();
        patches.setMatrixAt(index, patch.matrix);
        const seed = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), grainMaterial);
        seed.position.set(px, -radius * 0.23, pz);
        seed.scale.set(0.7, 1.7, 0.65);
        seed.rotation.set(0, index * 2.4, Math.PI * 0.37);
        seed.castShadow = true;
        seed.userData.feedbackId = item.id;
        scene.add(seed);
        markers.set(item.id, seed);
        if (!knownIds.has(item.id)) arrivals.push(seed);
        raycastTargets.push(seed);
      });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown: { x: number; y: number } | null = null;
    function hitAt(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(raycastTargets, false)[0]?.object.userData.feedbackId as string | undefined;
    }
    function onPointerDown(event: PointerEvent) {
      pointerDown = { x: event.clientX, y: event.clientY };
    }
    function onPointerUp(event: PointerEvent) {
      if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 7) return;
      const id = hitAt(event);
      if (id) onSelectRef.current(id);
      pointerDown = null;
    }
    function onPointerMove(event: PointerEvent) {
      renderer.domElement.style.cursor = hitAt(event) ? "pointer" : "grab";
    }
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const destination = new THREE.Vector3();
    const focalPoint = new THREE.Vector3();
    const direction = new THREE.Vector3(0.32, 0.55, 1).normalize();
    const right = new THREE.Vector3(1, 0, -0.32).normalize();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastId: string | null | undefined;
    let lastAspect = 0;
    let moving = false;
    const arrivalStart = performance.now();
    let previousTime = arrivalStart;
    const stopFlight = () => { moving = false; };
    controls.addEventListener("start", stopFlight);
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min(0.1, (now - previousTime) / 1000);
      previousTime = now;
      if (arrivals.length) {
        const progress = reducedMotion.matches ? 1 : Math.min(1, (now - arrivalStart) / 1600);
        for (const seed of arrivals) {
          // Let each new seed fall into its own patch and bounce once.
          const lift = progress < 0.65
            ? 1 - (progress / 0.65) ** 2
            : 0.18 * Math.sin(Math.PI * (progress - 0.65) / 0.35);
          seed.position.y = -radius * 0.23 + lift * radius * 10;
        }
        if (progress === 1) arrivals.length = 0;
      }
      if (active.current !== lastId || camera.aspect !== lastAspect) {
        lastId = active.current;
        lastAspect = camera.aspect;
        const marker = lastId ? markers.get(lastId) : undefined;
        const distance = marker ? 3.8 : Math.max(16, 20 / camera.aspect);
        focalPoint.set(0, 0, 0);
        if (marker) {
          focalPoint.copy(marker.position);
          focalPoint.addScaledVector(right, distance * camera.aspect * 0.19);
        }
        destination.copy(focalPoint).addScaledVector(direction, distance);
        moving = true;
      }
      if (moving) {
        const fraction = reducedMotion.matches ? 1 : 1 - Math.exp(-4 * dt);
        camera.position.lerp(destination, fraction);
        controls.target.lerp(focalPoint, fraction);
        moving = camera.position.distanceToSquared(destination) > 0.00001;
      }
      controls.update();
      if (!document.hidden) renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      controls.dispose();
      patches.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material instanceof THREE.MeshBasicMaterial && material.map) material.map.dispose();
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
      soil.dispose();
    };
  }, [items, locale]);

  return (
    <div ref={hostRef} className="relative h-full min-h-[360px] w-full" role="region" aria-label={locale === "id" ? "Peta benih" : "Seed field"}>
      {story && <article key={story.id} className="field-story">
        <div className="story-byline"><img src="/brand/rice-emblem.png" alt="" width="34" height="34" />
          <div><strong>{story.name || (locale === "id" ? "Anonim" : "Anonymous")}</strong>
            <RiceRating value={story.rating} locale={locale} />
          </div>
        </div>
        <blockquote tabIndex={0}>{story.message}</blockquote>
      </article>}
      {unavailable && <p className="absolute bottom-20 left-4 text-xs">{locale === "id" ? "Mode baca" : "Reading view"}</p>}

    </div>
  );
}
