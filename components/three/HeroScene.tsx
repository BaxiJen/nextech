'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CrystalMesh } from './CrystalMesh';
import { Particles } from './Particles';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, 2, 4]} intensity={0.6} color="#00E5FF" />
      <pointLight position={[3, -2, -4]} intensity={0.4} color="#3D9942" />
      <CrystalMesh />
      <Particles />
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}