import React, { Suspense, useRef, useState, useEffect } from "react";

import { SeasonProvider } from "./contexts/SeasonContext";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import FishManager from "./components/FishManager";
import ParticleLayer from "./components/ParticleLayer";
import Clouds from "./components/Clouds";
import Ground from "./components/Ground";

const WaterPlantsLarge = React.lazy(
  () => import("./components/WaterPlantsLarge")
);
const PottedPlant = React.lazy(() => import("./components/PottedPlant"));
const Rocks = React.lazy(() => import("./components/Rocks"));
const BubbleEffect = React.lazy(() => import("./components/BubbleEffect"));

import UI from "./components/UI";
import "./App.css";
import { useSeason } from "./contexts/SeasonContext";

const SIMULATED_SECONDS_PER_REAL_SECOND = 48; // 1実秒あたりに進むシミュレーション秒数

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
    // Set the time to morning, around 5:00 AM, which is 5 * 60 = 300 minutes
    setSimulatedTime({ minutes: 300, seconds: 0 });
    setIsDay(false); // 5 AM is before 6 AM, so it's night
    // Enable time progression for a 24-hour day to pass in 30 minutes of real time
    const interval = setInterval(() => {
      setSimulatedTime((prev) => {
        const totalSeconds = (prev.minutes * 60 + prev.seconds + SIMULATED_SECONDS_PER_REAL_SECOND) % 86400; // Increment by SIMULATED_SECONDS_PER_REAL_SECOND every real second (1440 minutes / 1800 seconds = 0.8 minutes per second)
        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;
        setIsDay(newMinutes % 1440 < 360 || newMinutes % 1440 >= 1080); // Day from 6 AM (360 minutes) to 6 PM (1080 minutes)
        return { minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // useFrameはCanvasの外では使用できません、Canvas内のコンポーネントに移動しました

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 読み込みの遅延をシミュレートするか、アセットの読み込みを待つ
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 読み込み画面のための2秒の遅延
    return () => clearTimeout(timer);
  }, []);

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
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "#1A1A2E", // 初期読み込みのための暗い背景
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: "bold",
              zIndex: 100,
              flexDirection: "column",
              opacity: 1,
              transition: "opacity 1s ease-out", // フェードアウト効果
            }}
            onAnimationEnd={() => setIsLoading(false)}
          >
            <h1>Loading Biotope...</h1>
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "5px solid white",
                borderTop: "5px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginTop: "20px",
              }}
            />
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}
        <h1 style={{ textAlign: "center", paddingTop: "20px", color: "white" }}>
          Biotope
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
          gl={{ antialias: true }} // よりスムーズなレンダリングのためにアンチエイリアシングを有効化
        >
          <Suspense fallback={null}>
            <color attach="background" args={[isDay ? "#4A90E2" : "#2A2A4E"]} />{" "}
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
            />{" "}
            {/* 昼と夜のための環境光の調整 */}
            <pointLight
              ref={pointLightRef}
              position={[10, 10, 10]}
              intensity={0.5}
              color="#FFFFFF"
            />{" "}
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
            />{" "}
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
            />{" "}
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
            <Ground />{" "}
            {/* 影を受けるための地面コンポーネント - コンポーネント内で処理 */}
            <FishManager />{" "}
            {/* 影を投げ、受けるための魚 - コンポーネント内で処理 */}
            <WaterPlantsLarge />{" "}
            {/* 影を投げ、受けるための植物 - コンポーネント内で処理 */}
            <WaterPlantsLarge />{" "}
            {/* 影を投げ、受けるための大きな植物 - コンポーネント内で処理 */}
            <PottedPlant />{" "}
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
            <FallenLeaves />{" "}
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
      // サイン波でy位置を調整して、より顕著な波をシミュレート
      meshRef.current.position.y = 8 + Math.sin(time * 1.5) * 0.5;

      // 光の反射に影響を与えるためにジオメトリの頂点を変更して、より顕著な波紋効果を作成
      const positions = geometryRef.current.attributes.position
        .array as Float32Array;
      const width = 80; // スケールに一致
      const height = 80; // スケールに一致
      const segments = 32; // より滑らかな波紋のための解像度を増加
      for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
          const index = (i * (segments + 1) + j) * 3 + 2; // z座標インデックス
          const x = (i / segments - 0.5) * width;
          const y = (j / segments - 0.5) * height;
          // よりダイナミックな光の反射のために振幅を増加し、波のパターンを変化
          positions[index] =
            Math.sin(x * 0.3 + time * 2.5) *
            Math.cos(y * 0.3 + time * 2.5) *
            1.2;
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
      scale={[80, 80, 1]} // さらに広い範囲をカバーするために大幅に拡張
      receiveShadow={true} // 水面が影を受け取れるようにする
    >
      <planeGeometry ref={geometryRef} args={[1, 1, 32, 32]} />{" "}
      {/* 波紋のための解像度を増加 */}
      <meshStandardMaterial
        color="#4A90E2"
        transparent={true}
        opacity={0.3} // より明確な反射のために不透明度をさらに減少
        side={THREE.DoubleSide} // 下から見えるように両面レンダリング
        metalness={0.9} // より強い鏡のような効果のために金属性を増加
        roughness={0.1} // よりシャープで明確な反射のために粗さをさらに減少
        envMapIntensity={1.5} // より良い反射の視認性のために環境マップの強度を増加
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
      // 照明の変更のためのスムーズな切り替え
      const targetIntensity = isDay ? 5.0 : 1.0;
      const targetAmbientIntensity = isDay ? 0.5 : 0.3;
      const targetPointIntensity = isDay ? 0.5 : 0.4;
      const targetSpotIntensity = isDay ? 1.0 : 0.6;
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

  return null; // このコンポーネントは目に見えるものをレンダリングしません
};

// 水波と一緒に動く日時計ノモンコンポーネント
const SundialGnomon: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // 水面と同じ波パターンで移動
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
      {/* 木のような外観のための茶色がかった色 */}
    </mesh>
  );
};

// 水波と一緒に動く時間目と数字付き日時計ベースコンポーネント
const SundialBase: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const hourTextRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // 水面と同じ波パターンでベースを移動
      groupRef.current.position.y = 8.1 + Math.sin(time * 1.5) * 0.5;
    }
    // 水波と同期する時間数字のための強化された波紋効果
    hourTextRefs.current.forEach((ref, i) => {
      if (ref) {
        const angle = i * (Math.PI / 6); // 1時間ごとに30度
        const x = 5 * Math.cos(angle);
        const z = 5 * Math.sin(angle);
        const rippleHeight =
          Math.sin(x * 0.2 + time * 1.5) * Math.cos(z * 0.2 + time * 1.5) * 0.4; // 振幅を増加し、水波の速度と同期
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
          opacity={0.4} // ベース上で影をより見えるようにするために不透明度を減少
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[...Array(12)].map((_, i) => {
        const hour = i === 0 ? 12 : i;
        const angle = i * (Math.PI / 6); // 1時間ごとに30度
        return (
          <Text
            key={i}
            ref={(el) => (hourTextRefs.current[i] = el!)}
            position={[4.5 * Math.cos(angle), 0.1, 4.5 * Math.sin(angle)]}
            rotation={[-Math.PI / 2, 0, angle + Math.PI / 2]} // 太陽の位置に向かって数字が向き合うようにする
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

const FallenLeaves: React.FC = () => {
  const { season } = useSeason();
  const leavesRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    leavesRefs.current.forEach((ref, i) => {
      if (ref) {
        // 計算負荷を減らすための簡略化された動き
        ref.position.y = 8.05 + Math.sin(time * 0.5 + i) * 0.05;
        // 計算を減らすための最小限の回転
        ref.rotation.y += 0.01;
      }
    });
  });

  if (season !== "autumn") {
    return null; // 秋の間だけ葉をレンダリング
  }

  // パフォーマンスへの影響を排除するためにテクスチャなしで最小限の葉を作成
  const leaves = Array.from({ length: 2 }, (_, i) => {
    const x = (Math.random() - 0.5) * 10; // 位置のための最小限の範囲
    const z = (Math.random() - 0.5) * 10;
    return (
      <mesh
        key={i}
        ref={(el) => (leavesRefs.current[i] = el!)}
        position={[x, 8.05, z]} // 水面の少し上
        rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]} // ランダムな初期回転
        scale={[0.2, 0.2, 0.2]} // 葉のための小さなスケール
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#8B4513" // テクスチャの読み込みに失敗した場合のフォールバックカラー
          map={new THREE.TextureLoader().load(
            "../assets/AI Dried Bay Leaves.png",
            undefined,
            undefined,
            (err) => {
              console.error("Failed to load leaf texture", err);
            }
          )}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  });

  return <group>{leaves}</group>;
};

export default App;
