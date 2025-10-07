const Loader = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #87CEEB 0%, #4A90E2 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      zIndex: 100,
      overflow: "hidden",
    }}
  >
    {/* 背景の波紋エフェクト */}
    <div
      style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        animation: "ripple 3s ease-out infinite",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        animation: "ripple 3s ease-out infinite 1s",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        animation: "ripple 3s ease-out infinite 2s",
      }}
    />

    {/* 便箋風のカード */}
    <div
      style={{
        position: "relative",
        zIndex: 1,
        background: "rgba(245, 230, 211, 0.95)",
        padding: "60px 50px",
        borderRadius: "8px",
        border: "2px solid #d4a574",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        maxWidth: "500px",
        animation: "floatIn 1.5s ease-out",
        fontFamily: "'Noto Serif JP', serif",
      }}
    >
      {/* 装飾的なボーダー */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          right: "15px",
          bottom: "15px",
          border: "1px solid #d4a574",
          borderRadius: "4px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        {/* タイトル */}
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "400",
            margin: "0 0 20px 0",
            color: "#5d4e37",
            letterSpacing: "8px",
            animation: "fadeIn 2s ease-in",
          }}
        >
          Biotope
        </h1>

        {/* 水滴のようなローディング */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "flex-end",
            justifyContent: "center",
            margin: "30px 0",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#5d4e37",
              borderRadius: "50%",
              animation: "bounce 1.4s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#5d4e37",
              borderRadius: "50%",
              animation: "bounce 1.4s ease-in-out infinite 0.2s",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#5d4e37",
              borderRadius: "50%",
              animation: "bounce 1.4s ease-in-out infinite 0.4s",
            }}
          />
        </div>

        {/* サブタイトル */}
        <p
          style={{
            fontSize: "16px",
            fontWeight: "300",
            margin: "20px 0 0 0",
            color: "#8b7355",
            lineHeight: "1.8",
            animation: "fadeIn 2s ease-in 0.5s both",
          }}
        >
          ビオトープの世界へようこそ
        </p>
      </div>
    </div>

    <style>
      {`
        @keyframes ripple {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}
    </style>
  </div>
);

export default Loader;
