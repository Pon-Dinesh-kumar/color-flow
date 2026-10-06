import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CloudTransitionManager, TransitionState } from './CloudTransitionManager';
import { CloudCluster, createCloudShaderMaterial } from './CloudCluster';
import { CloudParticleSystem } from './CloudParticleSystem';
import { CloudTransitionAudio } from './CloudTransitionAudio';
import { CLOUD_THEMES, CloudThemeColors } from './CloudTheme';

export const CloudTransitionOverlay: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [transitionState, setTransitionState] = useState<TransitionState>(() =>
    CloudTransitionManager.getState()
  );

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pageSwitchedRef = useRef<boolean>(false);
  const particleSystemRef = useRef<CloudParticleSystem>(new CloudParticleSystem());

  useEffect(() => {
    const unsubscribe = CloudTransitionManager.subscribe((state) => {
      setTransitionState(state);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!transitionState.isActive) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- THREE.JS 3D CLOUD SCENE INITIALIZATION ---
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 50);
    camera.position.set(0, 0, 3.2);

    const theme: CloudThemeColors = CLOUD_THEMES[transitionState.theme] || CLOUD_THEMES.default;
    const cloudMaterial = createCloudShaderMaterial(theme);
    const sharedGeom = new THREE.SphereGeometry(1.0, 24, 24);

    // Compute frustum bounds at camera distance to ensure 100% viewport coverage
    const vFOV = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * 3.2;
    const visibleWidth = visibleHeight * camera.aspect;

    // Construct 3D Cloud Clusters to blanket the entire screen (Top Canopy, Flanks, Center, Bottom)
    const clusters: CloudCluster[] = [];

    // 1. TOP CANOPY (Hanging downwards to guarantee 100% top/status bar coverage)
    clusters.push(
      new CloudCluster(sharedGeom, cloudMaterial, {
        type: 'topCanopy',
        position: new THREE.Vector3(0, visibleHeight * 0.46, 0.1),
        targetPosition: new THREE.Vector3(0, visibleHeight * 0.46, 0.1),
        entryOffset: new THREE.Vector3(0, visibleHeight * 0.6, 0),
        exitOffset: new THREE.Vector3(0, visibleHeight * 0.7, 0),
        scale: new THREE.Vector3(visibleWidth * 0.85, 1.12, 1.05),
        rotation: new THREE.Euler(0, 0, 0),
        speedParallax: 0.4,
      })
    );
    clusters.push(
      new CloudCluster(sharedGeom, cloudMaterial, {
        type: 'topCanopy',
        position: new THREE.Vector3(0, visibleHeight * 0.36, -0.1),
        targetPosition: new THREE.Vector3(0, visibleHeight * 0.36, -0.1),
        entryOffset: new THREE.Vector3(0, visibleHeight * 0.6, 0),
        exitOffset: new THREE.Vector3(0, visibleHeight * 0.7, 0),
        scale: new THREE.Vector3(visibleWidth * 0.80, 1.08, 1.0),
        rotation: new THREE.Euler(0, 0, 0.02),
        speedParallax: 0.5,
      })
    );

    // 2. UPPER-MID FLANKS (Refined, smaller puffy cumulus clouds)
    clusters.push(
      new CloudCluster(sharedGeom, cloudMaterial, {
        type: 'large',
        position: new THREE.Vector3(-visibleWidth * 0.32, visibleHeight * 0.16, 0.2),
        targetPosition: new THREE.Vector3(-visibleWidth * 0.32, visibleHeight * 0.16, 0.2),
        entryOffset: new THREE.Vector3(-visibleWidth * 0.65, 0, 0),
        exitOffset: new THREE.Vector3(-visibleWidth * 0.75, 0, 0),
        scale: new THREE.Vector3(1.22, 1.18, 1.15),
        rotation: new THREE.Euler(0, 0, -0.05),
        speedParallax: 0.7,
      })
    );
    clusters.push(
      new CloudCluster(sharedGeom, cloudMaterial, {
        type: 'large',
        position: new THREE.Vector3(visibleWidth * 0.32, visibleHeight * 0.16, 0.2),
        targetPosition: new THREE.Vector3(visibleWidth * 0.32, visibleHeight * 0.16, 0.2),
        entryOffset: new THREE.Vector3(visibleWidth * 0.65, 0, 0),
        exitOffset: new THREE.Vector3(visibleWidth * 0.75, 0, 0),
        scale: new THREE.Vector3(1.22, 1.18, 1.15),
        rotation: new THREE.Euler(0, 0, 0.05),
        speedParallax: 0.7,
      })
    );

    // 3. CENTER BILLOWING MASS
    clusters.push(
      new CloudCluster(sharedGeom, cloudMaterial, {
        type: 'large',
        position: new THREE.Vector3(0, -visibleHeight * 0.04, 0.3),
        targetPosition: new THREE.Vector3(0, -visibleHeight * 0.04, 0.3),
        entryOffset: new THREE.Vector3(0, -visibleHeight * 0.6, 0),
        exitOffset: new THREE.Vector3(0, -visibleHeight * 0.7, 0),
        scale: new THREE.Vector3(1.28, 1.22, 1.18),
        rotation: new THREE.Euler(0, 0, 0.01),
        speedParallax: 0.9,
      })
    );

    // 4. LOWER FLANKS
    clusters.push(
      new CloudCluster(sharedGeom, cloudMaterial, {
        type: 'medium',
        position: new THREE.Vector3(-visibleWidth * 0.30, -visibleHeight * 0.24, 0.1),
        targetPosition: new THREE.Vector3(-visibleWidth * 0.30, -visibleHeight * 0.24, 0.1),
        entryOffset: new THREE.Vector3(-visibleWidth * 0.6, -visibleHeight * 0.2, 0),
        exitOffset: new THREE.Vector3(-visibleWidth * 0.7, -visibleHeight * 0.2, 0),
        scale: new THREE.Vector3(1.18, 1.14, 1.10),
        rotation: new THREE.Euler(0, 0, -0.06),
        speedParallax: 1.1,
      })
    );
    clusters.push(
      new CloudCluster(sharedGeom, cloudMaterial, {
        type: 'medium',
        position: new THREE.Vector3(visibleWidth * 0.30, -visibleHeight * 0.24, 0.1),
        targetPosition: new THREE.Vector3(visibleWidth * 0.30, -visibleHeight * 0.24, 0.1),
        entryOffset: new THREE.Vector3(visibleWidth * 0.6, -visibleHeight * 0.2, 0),
        exitOffset: new THREE.Vector3(visibleWidth * 0.7, -visibleHeight * 0.2, 0),
        scale: new THREE.Vector3(1.18, 1.14, 1.10),
        rotation: new THREE.Euler(0, 0, 0.06),
        speedParallax: 1.1,
      })
    );

    // 5. BOTTOM FOUNDATION CANOPY (Rising up from bottom)
    clusters.push(
      new CloudCluster(sharedGeom, cloudMaterial, {
        type: 'large',
        position: new THREE.Vector3(0, -visibleHeight * 0.44, 0.2),
        targetPosition: new THREE.Vector3(0, -visibleHeight * 0.44, 0.2),
        entryOffset: new THREE.Vector3(0, -visibleHeight * 0.65, 0),
        exitOffset: new THREE.Vector3(0, -visibleHeight * 0.75, 0),
        scale: new THREE.Vector3(visibleWidth * 0.90, 1.28, 1.20),
        rotation: new THREE.Euler(0, 0, 0),
        speedParallax: 1.3,
      })
    );

    for (const c of clusters) {
      scene.add(c.group);
    }

    startTimeRef.current = performance.now();
    pageSwitchedRef.current = false;

    // 0.00s: Classic breezy cloud whoosh sound only
    CloudTransitionAudio.playStart();
    let revealAudioPlayed = false;

    const render = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;

      // 0.35s: Seamless page switch behind full cloud cover
      if (elapsed >= 0.35 && !pageSwitchedRef.current) {
        pageSwitchedRef.current = true;
        const req = CloudTransitionManager.getPendingRequest();
        req?.onPageSwitch?.();
      }

      // 0.70s: Parting reveal cloud whoosh sound
      if (elapsed >= 0.70 && !revealAudioPlayed) {
        revealAudioPlayed = true;
        CloudTransitionAudio.playReveal();
      }

      // 1.15s: Smoothly finish transition (snappy, doesn't stay too long)
      if (elapsed >= 1.15) {
        CloudTransitionManager.finishTransition();
        renderer.dispose();
        sharedGeom.dispose();
        cloudMaterial.dispose();
        return;
      }

      // --- STORYBOARD BALANCED TIMELINE (1.15s TOTAL) ---
      let entryProgress = 0;
      let exitProgress = 0;
      let flyProgress = 0;

      if (elapsed < 0.35) {
        // Fast yet smooth entry: easeOutCubic (0.00s -> 0.35s)
        const t = Math.min(1.0, elapsed / 0.35);
        entryProgress = 1 - Math.pow(1 - t, 3);
      } else if (elapsed <= 0.70) {
        // Snappy fly-through moment (0.35s -> 0.70s)
        entryProgress = 1.0;
        flyProgress = (elapsed - 0.35) / 0.35;
      } else {
        // Silky parting reveal: easeInOutCubic (0.70s -> 1.15s)
        entryProgress = 1.0;
        const t = Math.min(1.0, (elapsed - 0.70) / 0.45);
        exitProgress = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      // Camera forward cruise during fly-through
      if (flyProgress > 0 && exitProgress === 0) {
        camera.position.z = 3.2 - flyProgress * 0.40;
      } else if (exitProgress > 0) {
        camera.position.z = 2.80 - exitProgress * 0.20;
      } else {
        camera.position.z = 3.2;
      }

      cloudMaterial.uniforms.uTime.value = elapsed;

      // Update 3D cluster transforms
      for (const c of clusters) {
        c.updateTransform(entryProgress, exitProgress, flyProgress);
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      renderer.dispose();
      sharedGeom.dispose();
      cloudMaterial.dispose();
    };
  }, [transitionState.isActive]);

  if (!transitionState.isActive) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-auto overflow-hidden select-none"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
