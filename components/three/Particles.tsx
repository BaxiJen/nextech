'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 300;

const vertexShader = `
  uniform float uTime;
  uniform float uSize;
  attribute float aScale;
  attribute float aSpeed;
  attribute float aOffset;
  varying float vAlpha;
  varying float vScale;

  void main() {
    vec3 pos = position;
    
    // Floating motion
    float t = uTime * aSpeed + aOffset;
    pos.x += sin(t * 0.7 + pos.y * 0.5) * 0.5;
    pos.y += cos(t * 0.5 + pos.x * 0.3) * 0.3 + sin(t * 0.3) * 0.2;
    pos.z += sin(t * 0.6 + pos.z * 0.4) * 0.4;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Distance-based alpha
    float dist = length(mvPosition.xyz);
    vAlpha = smoothstep(15.0, 3.0, dist) * 0.6;
    vScale = aScale;
    
    gl_PointSize = uSize * aScale * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vScale;

  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft glow
    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    
    // Add slight color variation
    vec3 color = uColor;
    color += vScale * 0.1;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export function Particles({ color = '#00E5FF', count = PARTICLE_COUNT }: { 
  color?: string; 
  count?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, scales, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute in a sphere around center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      scales[i] = 0.3 + Math.random() * 1.0;
      speeds[i] = 0.2 + Math.random() * 0.5;
      offsets[i] = Math.random() * Math.PI * 2;
    }

    return { positions, scales, speeds, offsets };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSize: { value: 3.0 },
    uColor: { value: new THREE.Color(color) },
  }), [color]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aScale"
          args={[scales, 1]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[speeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aOffset"
          args={[offsets, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}