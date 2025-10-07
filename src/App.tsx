import React, { Suspense, useRef } from "react";

import { SeasonProvider } from "./contexts/SeasonContext";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import FishManager from "./components/FishManager";
import ParticleLayer from "./components/ParticleLayer";
import Clouds from "./components/Clouds";
import WindDirectionDisplay from "./components/WindDirectionDisplay";
import Ground from "./components/Ground";
import Stars from "./components/Stars";
import ReflectedStars from "./components/ReflectedStars";
import WaterSurface from "./components/WaterSurface";
import LightingController from "./components/LightingController";
import SundialGnomon from "./components/SundialGnomon";
import SundialBase from "./components/SundialBase";
import FallenLeaves from "./components/FallenLeaves";
import Loader from "./components/Loader";

const WaterPlantsLarge = React.lazy(
  () => import("./components/WaterPlantsLarge")
);
const PottedPlant = React.lazy(() => import("./components/PottedPlant"));
const Rocks = React.lazy(() => import("./components/Rocks"));
const BubbleEffect = React.lazy(() => import("./components/BubbleEffect"));

import UI from "./components/UI";
import "./App.css";
import { SIMULATED_SECONDS_PER_REAL_SECOND } from "./constants";
import { useSimulatedTime } from "./hooks/useSimulatedTime";
import { useWindDirection } from "./hooks/useWindDirection";
import { useLoader } from "./hooks/useLoader";

function App() {
  const { isDay, simulatedTime } = useSimulatedTime();
  const windDirection = useWindDirection();
  const showLoader = useLoader();
  const directionalLightRef = useRef<THREE.DirectionalLight>(null!);
  const ambientLightRef = useRef<THREE.AmbientLight>(null!);
  const pointLightRef = useRef<THREE.PointLight>(null!);
  const spotLightRef = useRef<THREE.SpotLight>(null!);

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
          backgroundColor: isDay ? "#4A90E2" : "#2A2A4E", // 昼と夜の背景の切り替え、夜を明るく
          overflow: "hidden",
          transition: "background-color 2s ease", // 背景色のスムーズな切り替え
        }}
      >
        {showLoader && <Loader />}
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
          }}
          camera={{ position: [5, 3, 0], fov: 70 }}
          gl={{ antialias: true }} // よりスムーズなレンダリングのためにアンチエイリアシングを有効化
        >
          <Suspense fallback={null}>
            <Stars isNight={!isDay} />
            <ReflectedStars isNight={!isDay} />
            <color attach="background" args={[isDay ? "#4A90E2" : "#2A2A4E"]} />
            {/* 3Dシーンの背景色の切り替え */}
            {/* 昼と夜のための霧の調整 */}
            <fog
              attach="fog"
              args={[isDay ? "#4A90E2" : "#2A2A4E", 10, isDay ? 60 : 40]}
            />
            <ambientLight
              ref={ambientLightRef}
              intensity={0.5}
              color="#87CEEB"
            />
            {/* 昼と夜のための環境光の調整 */}
            <pointLight
              ref={pointLightRef}
              position={[10, 10, 10]}
              intensity={0.5}
              color="#FFFFFF"
            />
            {/* 昼と夜のためのポイントライトの調整 */}
            <directionalLight
              ref={directionalLightRef}
              position={[
                15 *
                  Math.cos(
                    ((simulatedTime.minutes / 60) % 12) * (Math.PI / 6)
                  ), // X位置は時間とともに移動（12時間サイクル）、時計時間に合わせるためのオフセットなし
                15, // 一定の高さ
                15 *
                  Math.sin(
                    ((simulatedTime.minutes / 60) % 12) * (Math.PI / 6)
                  ), // Z位置は時間とともに移動、時計時間に合わせるためのオフセットなし
              ]} // 太陽は時間に基づいて円形のパスで移動し、時計と同期
              intensity={8.0} // 影の視認性を高めるために強度をさらに増加
              color="#FFD700" // 太陽光を模倣するための暖かい黄色
              castShadow={true} // リアルな効果のための影を有効化
              shadow-mapSize={[1024, 1024]} // より良い品質のための高解像度のシャドウマップ
              shadow-camera-near={0.5} // シャドウカメラの近面を調整
              shadow-camera-far={50} // より広い範囲をカバーするために遠面を調整
              shadow-camera-left={-20} // シャドウカメラの範囲を拡張
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />
            {/* 太陽光または月光をシミュレートするために調整された指向性ライト */}
            {/* 小さな球体として太陽の可視表現 */}
            <mesh
              position={[
                15 *
                  Math.cos(
                    ((simulatedTime.minutes / 60) % 12) * (Math.PI / 6)
                  ),
                15,
                15 *
                  Math.sin(
                    ((simulatedTime.minutes / 60) % 12) * (Math.PI / 6)
                  ),
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
              intensity={1.0} // 太陽光とのバランスを取るために強度を減少
              color="#FFFFFF"
              castShadow={true}
            />
            {/* 昼と夜のためのスポットライトの調整 */}
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
              maxDistance={20} // 遠くから見ることを可能にするために増加
              minDistance={1} // 近くで検査することを可能にするために減少
              dampingFactor={0.1} // よりスムーズな動きのためのダンピングを増加
              enableDamping={true}
            />
            {/* <Pond /> ユーザーのリクエストによりコメントアウト */}
            <Ground />
            {/* 影を受けるための地面コンポーネント - コンポーネント内で処理 */}
            <FishManager />
            {/* 影を投げ、受けるための魚 - コンポーネント内で処理 */}
            <WaterPlantsLarge />
            {/* 影を投げ、受けるための植物 - コンポーネント内で処理 */}
            <PottedPlant />
            {/* 影を投げ、受けるための鉢植え植物 - コンポーネント内で処理 */}
            <Rocks /> {/* 影を投げ、受けるための岩 - コンポーネント内で処理 */}
            {/* ノブドウェルクは一時的に無効化されています */}
            <BubbleEffect />
            {/* 動きのあるカスタム水面 - バウンディングボックスの上面に配置 */}
            <WaterSurface />
            {/* 水面上の日時計効果のためのノモン、波と一緒に動くようにアニメーション */}
            <SundialGnomon />
            {/* 水面上の日時計のための時間目付き円形ベース、波と一緒に動くようにアニメーション */}
            <SundialBase />
            <FallenLeaves />
            {/* 秋の間に水面に浮かぶ落ち葉コンポーネントを追加 */}
            <ParticleLayer />
            <Clouds timeScale={SIMULATED_SECONDS_PER_REAL_SECOND / 60} /> {/* 雲のコンポーネントに時間のスケールを渡す */}
            {/* 魚の動きを制限するためのバウンディングボックス - 垂直方向に拡大（Y軸）、水平方向に縮小（X軸）、底面はY=0より上、上面はさらに下げた */}
            <mesh position={[0, 4, 0.5]} scale={[12, 8, 5]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#FFFFFF" wireframe={true} />
            </mesh>
            {/* 座標系を視覚化するためのXYZ軸ヘルパー、ラベル付き */}
            <axesHelper args={[5]} />
            {/* XYZ軸のためのテキストラベル */}
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
          </Suspense>
        </Canvas>
        <UI simulatedTime={simulatedTime} isDay={isDay} />
        <WindDirectionDisplay windDirection={windDirection} />
      </div>
    </SeasonProvider>
  );
}


export default App;
