import React, { useRef, useState, useEffect } from "react";
import Clock from "react-clock";
import "react-clock/dist/Clock.css";
import { SeasonProvider } from "./contexts/SeasonContext";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import FishManager from "./components/FishManager";
import ParticleLayer from "./components/ParticleLayer";
import Ground from "./components/Ground";
import WaterPlants from "./components/WaterPlants";
import WaterPlantsLarge from "./components/WaterPlantsLarge";
import PottedPlant from "./components/PottedPlant";
import Rocks from "./components/Rocks";
import KnobbedWhelk from "./components/KnobbedWhelk";
import BubbleEffect from "./components/BubbleEffect";
import UI from "./components/UI";
import "./App.css";

function App() {
  const [isDay, setIsDay] = useState(true);
  const [simulatedTime, setSimulatedTime] = useState({
    minutes: 0,
    seconds: 0,
  });
  const directionalLightRef = useRef<THREE.DirectionalLight>(null!);
  const ambientLightRef = useRef<THREE.AmbientLight>(null!);
  const pointLightRef = useRef<THREE.PointLight>(null!);
  const spotLightRef = useRef<THREE.SpotLight>(null!);

  useEffect(() => {
    // Set the time to evening, around 17:00 (5 PM), which is 17 * 60 = 1020 minutes
    setSimulatedTime({ minutes: 1020, seconds: 0 });
    setIsDay(true); // Evening is still considered day
    // Enable time progression for a 24-hour day to pass in 30 minutes of real time
    const interval = setInterval(() => {
      setSimulatedTime((prev) => {
        const totalSeconds = (prev.minutes * 60 + prev.seconds + 48) % 86400; // Increment by 48 seconds every real second (1440 minutes / 1800 seconds = 0.8 minutes per second)
        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;
        setIsDay(newMinutes < 720); // Day for first 12 hours (720 minutes), Night for next 12 hours
        return { minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // useFrame cannot be used outside Canvas, moved to a component inside Canvas

  return (
    <SeasonProvider>
      <div
        className="App"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          margin: 0,
          border: "none",
          backgroundColor: isDay ? "#4A90E2" : "#1A1A2E", // Transition between day and night background
          overflow: "hidden",
          transition: "background-color 2s ease", // Smooth transition for background color
        }}
      >
        <h1 style={{ textAlign: "center", paddingTop: "20px", color: "white" }}>
          ビオトープ
        </h1>
        <div
          style={{
            position: "absolute",
            top: "150px", // Moved further down to be slightly below the previous position
            right: "20px",
            width: "220px",
            height: "220px",
            zIndex: 10,
            backgroundColor: "rgba(0, 0, 0, 0.75)", // Darker background for better contrast
            borderRadius: "50%",
            border: "6px solid white",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.7)", // Stronger shadow for depth
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Clock
            value={
              new Date(
                0,
                0,
                0,
                Math.floor(simulatedTime.minutes / 60) % 24,
                simulatedTime.minutes % 60,
                simulatedTime.seconds
              )
            }
            size={200} // Increased size for better visibility
            renderNumbers={true}
            renderSecondHand={false} // Disable second hand
            hourHandLength={60} // Longer hour hand
            hourHandWidth={5} // Thicker hour hand
            minuteHandLength={80} // Longer minute hand
            minuteHandWidth={4} // Thicker minute hand
            secondHandLength={90} // Length of second hand
            secondHandWidth={2} // Width of second hand
            hourMarksLength={12} // Longer hour marks
            hourMarksWidth={4} // Thicker hour marks
            minuteMarksLength={6} // Longer minute marks
            minuteMarksWidth={2} // Thicker minute marks
            className="custom-clock"
          />
          {/* Day/Night indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "-50px", // Positioned further below the clock face
              width: "100%",
              textAlign: "center",
              color: "white",
              fontSize: "18px", // Slightly smaller font for a cleaner look
              fontWeight: "bold",
              textShadow: "1px 1px 3px black", // Subtle shadow for visibility
            }}
          >
            {isDay ? "Day" : "Night"}
          </div>
        </div>
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
          }}
          camera={{ position: [5, 3, 0], fov: 70 }}
          gl={{ antialias: true }} // Enable antialiasing for smoother rendering
        >
          <color attach="background" args={[isDay ? "#4A90E2" : "#1A1A2E"]} />{" "}
          {/* Transition background color for 3D scene */}
          {/* Fog adjusted for day and night */}
          <fog
            attach="fog"
            args={[isDay ? "#4A90E2" : "#1A1A2E", 10, isDay ? 60 : 40]}
          />
          <ambientLight ref={ambientLightRef} intensity={0.5} color="#87CEEB" />{" "}
          {/* Ambient light adjusts for day/night */}
          <pointLight
            ref={pointLightRef}
            position={[10, 10, 10]}
            intensity={0.5}
            color="#FFFFFF"
          />{" "}
          {/* Point light adjusts for day/night */}
          <directionalLight
            ref={directionalLightRef}
            position={[
              15 *
                Math.cos(((simulatedTime.minutes / 60) % 12) * (Math.PI / 6)), // X position moves with time (12-hour cycle), no offset to match clock time
              15, // Constant height
              15 *
                Math.sin(((simulatedTime.minutes / 60) % 12) * (Math.PI / 6)), // Z position moves with time, no offset to match clock time
            ]} // Sun moves in a circular path based on time, synchronized with clock
            intensity={8.0} // Increased intensity further for stronger shadow visibility
            color="#FFD700" // Warm yellow color to mimic sunlight
            castShadow={true} // Enable shadows for realistic effect
            shadow-mapSize={[1024, 1024]} // Higher resolution shadow map for better quality
            shadow-camera-near={0.5} // Adjusted near plane for shadow camera
            shadow-camera-far={50} // Adjusted far plane to cover larger area
            shadow-camera-left={-20} // Expanded shadow camera bounds
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />{" "}
          {/* Directional light adjusted to simulate sunlight or moonlight */}
          {/* Visible representation of the sun as a small sphere */}
          <mesh
            position={[
              15 *
                Math.cos(((simulatedTime.minutes / 60) % 12) * (Math.PI / 6)),
              15,
              15 *
                Math.sin(((simulatedTime.minutes / 60) % 12) * (Math.PI / 6)),
            ]}
          >
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={5.0}
            />
          </mesh>
          <spotLight
            ref={spotLightRef}
            position={[5, 8, 5]}
            angle={0.5}
            penumbra={0.2}
            intensity={1.0} // Reduced intensity to balance with sunlight
            color="#FFFFFF"
            castShadow={true}
          />{" "}
          {/* Spotlight adjusts for day/night */}
          <LightingController
            isDay={isDay}
            directionalLightRef={directionalLightRef}
            ambientLightRef={ambientLightRef}
            pointLightRef={pointLightRef}
            spotLightRef={spotLightRef}
          />
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            maxDistance={20} // Increased to allow viewing from further away
            minDistance={1} // Decreased to allow closer inspection
            dampingFactor={0.1} // Increased damping for smoother movement
            enableDamping={true}
          />
          {/* <Pond /> Commented out as per user request */}
          <Ground />{" "}
          {/* Ground component to receive shadows - to be handled within component */}
          <FishManager />{" "}
          {/* Fish to cast and receive shadows - to be handled within component */}
          <WaterPlants />{" "}
          {/* Plants to cast and receive shadows - to be handled within component */}
          <WaterPlantsLarge />{" "}
          {/* Large plants to cast and receive shadows - to be handled within component */}
          <PottedPlant />{" "}
          {/* Potted plants to cast and receive shadows - to be handled within component */}
          <Rocks />{" "}
          {/* Rocks to cast and receive shadows - to be handled within component */}
          <KnobbedWhelk />{" "}
          {/* Whelk to cast and receive shadows - to be handled within component */}
          <BubbleEffect />
          {/* Custom Water Surface with movement - positioned at the top face of the bounding box */}
          <WaterSurface />
          {/* Gnomon for sundial effect on water surface, animated to move with waves */}
          <SundialGnomon />
          {/* Circular base on water surface with hour marks for sundial, animated to move with waves */}
          <SundialBase />
          <ParticleLayer />
          {/* Bounding Box to confine fish movement - vertically enlarged (Y-axis), horizontally reduced (X-axis), bottom face above Y=0, top face lowered further */}
          <mesh position={[0, 4, 0.5]} scale={[12, 8, 5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#FFFFFF" wireframe={true} />
          </mesh>
          {/* XYZ Axes Helper to visualize coordinate system with labels */}
          <axesHelper args={[5]} />
          {/* Text labels for XYZ axes */}
          <Text
            position={[5.2, 0, 0]}
            rotation={[0, 0, 0]}
            fontSize={0.5}
            color="red"
            anchorX="left"
            anchorY="middle"
          >
            X
          </Text>
          <Text
            position={[0, 5.2, 0]}
            rotation={[0, 0, 0]}
            fontSize={0.5}
            color="green"
            anchorX="center"
            anchorY="bottom"
          >
            Y
          </Text>
          <Text
            position={[0, 0, 5.2]}
            rotation={[0, 0, 0]}
            fontSize={0.5}
            color="blue"
            anchorX="center"
            anchorY="middle"
          >
            Z
          </Text>
        </Canvas>
        <UI />
      </div>
    </SeasonProvider>
  );
}

const WaterSurface: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometryRef = useRef<THREE.PlaneGeometry>(null!);

  useFrame((state) => {
    if (meshRef.current && geometryRef.current) {
      const time = state.clock.getElapsedTime();
      // Simulate more pronounced waves by adjusting the y position with a sine wave
      meshRef.current.position.y = 8 + Math.sin(time * 1.5) * 0.5;

      // Create a rippling effect by modifying the geometry vertices
      const positions = geometryRef.current.attributes.position
        .array as Float32Array;
      const width = 80; // Matches the scale
      const height = 80; // Matches the scale
      const segments = 32; // Increased resolution for smoother ripples
      for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
          const index = (i * (segments + 1) + j) * 3 + 2; // z-coordinate index
          const x = (i / segments - 0.5) * width;
          const y = (j / segments - 0.5) * height;
          positions[index] =
            Math.sin(x * 0.2 + time * 2) * Math.cos(y * 0.2 + time * 2) * 0.8;
        }
      }
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 8, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[80, 80, 1]} // Extended much further to cover an even larger area
      receiveShadow={true} // Ensure water surface can receive shadows
    >
      <planeGeometry ref={geometryRef} args={[1, 1, 32, 32]} />{" "}
      {/* Increased resolution for ripples */}
      <meshStandardMaterial
        color="#4A90E2"
        transparent={true}
        opacity={0.5} // Reduced opacity to make shadows more visible on water
        side={THREE.DoubleSide} // Double-sided rendering to be visible from below
      />
    </mesh>
  );
};

const LightingController: React.FC<{
  isDay: boolean;
  directionalLightRef: React.RefObject<THREE.DirectionalLight>;
  ambientLightRef: React.RefObject<THREE.AmbientLight>;
  pointLightRef: React.RefObject<THREE.PointLight>;
  spotLightRef: React.RefObject<THREE.SpotLight>;
}> = ({
  isDay,
  directionalLightRef,
  ambientLightRef,
  pointLightRef,
  spotLightRef,
}) => {
  useFrame((_, delta) => {
    if (
      directionalLightRef.current &&
      ambientLightRef.current &&
      pointLightRef.current &&
      spotLightRef.current
    ) {
      // Smooth transition for lighting changes
      const targetIntensity = isDay ? 5.0 : 0.2;
      const targetAmbientIntensity = isDay ? 0.5 : 0.1;
      const targetPointIntensity = isDay ? 0.5 : 0.2;
      const targetSpotIntensity = isDay ? 1.0 : 0.3;
      const targetColor = isDay ? "#FFD700" : "#CCCCCC";
      const targetAmbientColor = isDay ? "#87CEEB" : "#333333";

      directionalLightRef.current.intensity +=
        (targetIntensity - directionalLightRef.current.intensity) * delta * 2;
      directionalLightRef.current.color.set(targetColor);
      ambientLightRef.current.intensity +=
        (targetAmbientIntensity - ambientLightRef.current.intensity) *
        delta *
        2;
      ambientLightRef.current.color.set(targetAmbientColor);
      pointLightRef.current.intensity +=
        (targetPointIntensity - pointLightRef.current.intensity) * delta * 2;
      spotLightRef.current.intensity +=
        (targetSpotIntensity - spotLightRef.current.intensity) * delta * 2;
    }
  });

  return null; // This component doesn't render anything visible
};

// Sundial Gnomon component to move with water waves
const SundialGnomon: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // Move with the same wave pattern as the water surface
      meshRef.current.position.y = 8.2 + Math.sin(time * 1.5) * 0.5;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 8.2, 0]}
      rotation={[0, 0, 0]}
      scale={[0.5, 2, 0.5]}
      castShadow={true}
    >
      <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
      <meshStandardMaterial color="#8B4513" />{" "}
      {/* Brownish color for wood-like appearance */}
    </mesh>
  );
};

// Sundial Base component with hour marks and numbers to move with water waves
const SundialBase: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const hourMarkRefs = useRef<THREE.Mesh[]>([]);
  const hourTextRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Move the base with the same wave pattern as the water surface
      groupRef.current.position.y = 8.1 + Math.sin(time * 1.5) * 0.5;
    }
    // Individual ripple effect for hour numbers
    hourTextRefs.current.forEach((ref, i) => {
      if (ref) {
        const angle = i * (Math.PI / 6); // 30 degrees per hour
        const x = 5 * Math.cos(angle);
        const z = 5 * Math.sin(angle);
        const rippleHeight =
          Math.sin(x * 0.2 + time * 2) * Math.cos(z * 0.2 + time * 2) * 0.2;
        ref.position.y = 0.1 + rippleHeight;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 8.1, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[10, 10, 0.1]}
        receiveShadow={true}
      >
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial
          color="#4682B4"
          opacity={0.4} // Reduced opacity to make shadows more visible on the base
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[...Array(12)].map((_, i) => {
        const hour = i === 0 ? 12 : i;
        const angle = i * (Math.PI / 6); // 30 degrees per hour
        return (
          <Text
            key={i}
            ref={(el) => (hourTextRefs.current[i] = el!)}
            position={[4.5 * Math.cos(angle), 0.1, 4.5 * Math.sin(angle)]}
            rotation={[-Math.PI / 2, 0, angle + Math.PI / 2]} // Orient numbers to face towards the sun's position
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {hour}
          </Text>
        );
      })}
    </group>
  );
};

export default App;
