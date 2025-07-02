import React, { useEffect, useState } from "react";
import { useSeason } from "../contexts/SeasonContext";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  color: string;
  size: number;
  life: number;
}

const ParticleLayer: React.FC = () => {
  const { season } = useSeason();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Initialize particles based on season
    const newParticles: Particle[] = [];
    let particleColor: string;
    let particleCount: number;
    let speedYRange: [number, number];
    let particleSizeModifier: number = 1.0; // Default size modifier

    switch (season) {
      case "spring":
        particleColor = "#FFB6C1"; // LightPink (petals)
        particleCount = 15; // Reduced from 50
        speedYRange = [0.025, 0.05]; // Reduced speed for slower animation
        break;
      case "summer":
        particleColor = "#98FB98"; // PaleGreen (leaves)
        particleCount = 10; // Reduced from 20
        speedYRange = [0.01, 0.025]; // Reduced speed for slower animation
        particleSizeModifier = 0.5; // Even smaller particles for summer
        break;
      case "autumn":
        particleColor = "#FFA500"; // Orange (fallen leaves)
        particleCount = 5; // Further reduced for better performance
        speedYRange = [0.005, 0.015]; // Slower speed for gentler fall
        particleSizeModifier = 1.2; // Larger particles for autumn leaves
        break;
      case "winter":
        particleColor = "#FFFFFF"; // White (snow)
        particleCount = 20; // Reduced from 60
        speedYRange = [0.005, 0.015]; // Reduced speed for slower animation
        particleSizeModifier = 0.5; // Even smaller particles for winter
        break;
      default:
        particleColor = "#FFB6C1";
        particleCount = 15; // Reduced from 50
        speedYRange = [0.025, 0.05]; // Reduced speed for slower animation
    }

    for (let i = 0; i < particleCount; i++) {
      const baseSize = 0.03 + Math.random() * 0.07; // Reduced particle size slightly
      const finalSize = baseSize * (particleSizeModifier || 1.0); // Apply seasonal size modifier if exists
      newParticles.push({
        id: i,
        x: Math.random() * 10 - 5,
        y: Math.random() * 5,
        z: Math.random() * 5 - 2.5,
        speedX: Math.random() * 0.02 - 0.01,
        speedY:
          speedYRange[0] + Math.random() * (speedYRange[1] - speedYRange[0]),
        speedZ: Math.random() * 0.02 - 0.01,
        color: particleColor,
        size: finalSize,
        life: Math.random() * 100 + 100,
      });
    }
    setParticles(newParticles);
  }, [season]);

  useFrame(() => {
    setParticles((prevParticles) =>
      prevParticles
        .map((particle) => {
          const newY = particle.y - particle.speedY;
          const newX = particle.x + particle.speedX;
          const newZ = particle.z + particle.speedZ;
          const newLife = particle.life - 1;

          if (newY < -2 || newLife <= 0) {
            return {
              ...particle,
              y: 5,
              x: Math.random() * 10 - 5,
              z: Math.random() * 5 - 2.5,
              life: Math.random() * 100 + 100,
            };
          }
          return { ...particle, y: newY, x: newX, z: newZ, life: newLife };
        })
        .filter((particle) => particle.life > 0)
    );
  });

  return (
    <group>
      {particles.map((particle) => (
        <mesh key={particle.id} position={[particle.x, particle.y, particle.z]}>
          {season === "winter" ? (
            <sphereGeometry args={[particle.size, 8, 8]} />
          ) : (
            <boxGeometry
              args={[
                particle.size,
                particle.size,
                particle.size * (season === "autumn" ? 1.5 : 1),
              ]}
            />
          )}
          <meshStandardMaterial
            color={particle.color}
            transparent={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

export default ParticleLayer;
