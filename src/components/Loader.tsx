/**
 * ローディング画面コンポーネント
 * 水中から水面へ浮上する没入感のあるデザイン
 */
const Loader = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "#0a1f2e",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      zIndex: 100,
      overflow: "hidden",
    }}
  >
    {/* グラデーションメッシュ背景 - 深海から水面へ */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse at 20% 80%, rgba(8, 51, 71, 0.95) 0%, transparent 45%),
          radial-gradient(ellipse at 80% 20%, rgba(18, 87, 111, 0.85) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(31, 108, 129, 0.7) 0%, transparent 65%),
          radial-gradient(circle at 50% 0%, rgba(60, 140, 160, 0.3) 0%, transparent 60%),
          linear-gradient(180deg, #061420 0%, #0f2d3d 30%, #1a4a5e 60%, #2d6a7d 100%)
        `,
        animation: "gradientShift 10s ease-in-out infinite",
      }}
    />

    {/* グレインテクスチャオーバーレイ */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
        opacity: 0.3,
        mixBlendMode: "overlay",
      }}
    />

    {/* 浮遊する気泡 */}
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: `${Math.random() * 20 + 5}px`,
          height: `${Math.random() * 20 + 5}px`,
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1))",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          left: `${Math.random() * 100}%`,
          bottom: "-50px",
          animation: `bubble ${Math.random() * 6 + 4}s ease-in infinite`,
          animationDelay: `${Math.random() * 3}s`,
          filter: "blur(0.5px)",
        }}
      />
    ))}

    {/* 光の屈折レイヤー */}
    <div
      style={{
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(142, 202, 230, 0.15) 0%, transparent 40%),
          radial-gradient(ellipse at 30% 20%, rgba(120, 180, 200, 0.1) 0%, transparent 50%)
        `,
        animation: "lightShift 10s ease-in-out infinite alternate",
      }}
    />

    {/* メインコンテンツ */}
    <div
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
        animation: "floatUp 2s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* タイトル - 大胆で印象的に */}
      <h1
        style={{
          fontSize: "clamp(56px, 10vw, 110px)",
          fontWeight: "200",
          margin: 0,
          color: "transparent",
          background: "linear-gradient(135deg, #ffffff 0%, #e8f4f8 30%, #b8dde8 60%, #8ec6d9 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          letterSpacing: "0.2em",
          fontFamily: "'Noto Serif JP', serif",
          textShadow: "0 0 60px rgba(142, 202, 230, 0.8)",
          animation: "textGlow 4s ease-in-out infinite alternate",
          position: "relative",
          filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))",
        }}
      >
        Biotope
        {/* テキストの反射効果 */}
        <span
          style={{
            position: "absolute",
            top: "105%",
            left: 0,
            right: 0,
            background: "linear-gradient(180deg, rgba(142, 202, 230, 0.4) 0%, transparent 70%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            transform: "scaleY(-0.5) translateY(-10px)",
            opacity: 0.5,
            filter: "blur(3px)",
          }}
        >
          Biotope
        </span>
      </h1>

      {/* カスタムローディングアニメーション - 波紋 */}
      <div
        style={{
          position: "relative",
          width: "140px",
          height: "140px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* 中心の水滴 */}
        <div
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #ffffff, #e8f4f8 40%, #8ec6d9)",
            boxShadow: `
              0 0 30px rgba(142, 202, 230, 1),
              0 0 50px rgba(142, 202, 230, 0.6),
              inset -3px -3px 6px rgba(0, 0, 0, 0.3),
              inset 2px 2px 4px rgba(255, 255, 255, 0.4)
            `,
            animation: "pulse 2.5s ease-in-out infinite",
          }}
        />
        {/* 波紋エフェクト - 複数レイヤー */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: `${3 - i * 0.5}px solid rgba(142, 202, 230, ${0.7 - i * 0.1})`,
              animation: `rippleOut 4s cubic-bezier(0.22, 1, 0.36, 1) infinite`,
              animationDelay: `${i * 0.8}s`,
              boxShadow: `0 0 ${20 - i * 3}px rgba(142, 202, 230, ${0.5 - i * 0.1})`,
            }}
          />
        ))}
      </div>

      {/* サブタイトル */}
      <p
        style={{
          fontSize: "clamp(14px, 2vw, 20px)",
          fontWeight: "300",
          margin: 0,
          color: "#b8dde8",
          letterSpacing: "0.3em",
          fontFamily: "'Noto Serif JP', serif",
          opacity: 0,
          animation: "fadeInUp 1.5s ease-out 0.5s forwards",
          textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
        }}
      >
        ビオトープの世界へ
      </p>
    </div>

    {/* 魚の影 - 複数の魚が泳ぐ */}
    <div
      style={{
        position: "absolute",
        width: "80px",
        height: "30px",
        background: "linear-gradient(90deg, transparent, rgba(30, 70, 90, 0.6), transparent)",
        borderRadius: "50%",
        filter: "blur(12px)",
        top: "25%",
        left: "-100px",
        animation: "fishSwim1 14s ease-in-out infinite",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: "50px",
        height: "18px",
        background: "linear-gradient(90deg, transparent, rgba(40, 90, 110, 0.5), transparent)",
        borderRadius: "50%",
        filter: "blur(10px)",
        top: "60%",
        right: "-60px",
        animation: "fishSwim2 18s ease-in-out infinite",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: "65px",
        height: "24px",
        background: "linear-gradient(90deg, transparent, rgba(35, 80, 100, 0.55), transparent)",
        borderRadius: "50%",
        filter: "blur(11px)",
        top: "45%",
        left: "-80px",
        animation: "fishSwim3 20s ease-in-out infinite 5s",
      }}
    />

    <style>
      {`
        @keyframes gradientShift {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(10deg) brightness(1.1); }
        }

        @keyframes bubble {
          0% {
            transform: translateY(0) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
            transform: translateY(-10vh) translateX(0) scale(1);
          }
          100% {
            transform: translateY(-120vh) translateX(${Math.random() * 100 - 50}px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes lightShift {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(20px, -30px) rotate(5deg); }
        }

        @keyframes floatUp {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes textGlow {
          0% {
            text-shadow:
              0 0 30px rgba(142, 202, 230, 0.5),
              0 0 50px rgba(142, 202, 230, 0.3),
              0 0 70px rgba(142, 202, 230, 0.2);
          }
          50% {
            text-shadow:
              0 0 40px rgba(180, 220, 240, 0.8),
              0 0 70px rgba(142, 202, 230, 0.6),
              0 0 100px rgba(142, 202, 230, 0.4),
              0 0 130px rgba(100, 180, 210, 0.2);
          }
          100% {
            text-shadow:
              0 0 30px rgba(142, 202, 230, 0.5),
              0 0 50px rgba(142, 202, 230, 0.3),
              0 0 70px rgba(142, 202, 230, 0.2);
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }

        @keyframes rippleOut {
          0% {
            transform: scale(0.1);
            opacity: 1;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fishSwim1 {
          0% {
            left: -100px;
            top: 25%;
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            top: 28%;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            left: calc(100% + 100px);
            top: 25%;
            opacity: 0;
          }
        }

        @keyframes fishSwim2 {
          0% {
            right: -60px;
            top: 60%;
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          50% {
            top: 55%;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            right: calc(100% + 60px);
            top: 60%;
            opacity: 0;
          }
        }

        @keyframes fishSwim3 {
          0% {
            left: -80px;
            top: 45%;
            opacity: 0;
          }
          10% {
            opacity: 0.55;
          }
          50% {
            top: 42%;
          }
          90% {
            opacity: 0.55;
          }
          100% {
            left: calc(100% + 80px);
            top: 45%;
            opacity: 0;
          }
        }
      `}
    </style>
  </div>
);

export default Loader;
