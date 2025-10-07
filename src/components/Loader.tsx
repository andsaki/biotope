const Loader = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "#1A1A2E", // 初期ローディングのための暗い背景
      animation: "brightenBackground 9s forwards", // 背景色を明るくするアニメーション
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      color: "white",
      fontSize: "24px",
      fontWeight: "bold",
      zIndex: 100,
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "5px solid white",
        borderTop: "5px solid transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "20px",
      }}
    />
    <h1>Loading Biotope...</h1>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes brightenBackground {
          0% { background-color: #1A1A2E; }
          100% { background-color: #4A90E2; }
        }
      `}
    </style>
  </div>
);

export default Loader;
