import { SeasonProvider } from "./contexts/SeasonContext";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import Pond from "./components/Pond";
import FishManager from "./components/FishManager";
import ParticleLayer from "./components/ParticleLayer";
import Ground from "./components/Ground";
import UI from "./components/UI";
import "./App.css";

function App() {
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
          backgroundColor: "#4A90E2", // Water-like blue background
          overflow: "hidden",
        }}
      >
        <h1 style={{ textAlign: "center", paddingTop: "20px", color: "white" }}>
          ビオトープ
        </h1>
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
          <color attach="background" args={["#4A90E2"]} />{" "}
          {/* Water-like blue background for 3D scene */}
          <fog attach="fog" args={["#4A90E2", 5, 20]} />{" "}
          {/* Fog to simulate underwater depth */}
          <ambientLight intensity={0.8} color="#87CEEB" />{" "}
          {/* Light blue ambient light */}
          <pointLight position={[10, 10, 10]} intensity={1.0} color="#FFFFFF" />
          <directionalLight
            position={[0, 10, 5]}
            intensity={1.2}
            color="#ADD8E6"
          />{" "}
          {/* Light blue directional light */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            maxDistance={10}
            minDistance={2}
            dampingFactor={0.05} // Add damping for smoother camera movement
            enableDamping={true}
          />
          {/* <Pond /> */}
          <Ground />
          <FishManager />
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

export default App;
