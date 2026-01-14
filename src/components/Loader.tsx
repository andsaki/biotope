import styles from './Loader.module.css';

/**
 * ローディング画面コンポーネント
 * 水中から水面へ浮上する没入感のあるデザイン
 */
interface LoaderProps {
  progress?: number; // 0-100
  loadingText?: string;
}

const Loader = ({ progress = 0, loadingText = "読み込み中..." }: LoaderProps) => {
  // バブルデータ
  const bubbles = [
    { size: 18, left: 15, delay: 0, duration: 8 },
    { size: 12, left: 35, delay: 1.5, duration: 10 },
    { size: 22, left: 55, delay: 3, duration: 9 },
    { size: 14, left: 75, delay: 2, duration: 11 },
    { size: 16, left: 25, delay: 4, duration: 10.5 },
    { size: 20, left: 65, delay: 5.5, duration: 9.5 },
  ];

  return (
    <div className={styles.container}>
      {/* グラデーションメッシュ背景 - 深海から水面へ */}
      <div className={styles.backgroundGradient} />

      {/* グレインテクスチャオーバーレイ */}
      <div className={styles.grainOverlay} />

      {/* 浮遊する気泡 - 洗練された動き */}
      {bubbles.map((bubble, i) => (
        <div
          key={i}
          className={styles.bubble}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            boxShadow: `
              inset -2px -2px 4px rgba(0, 0, 0, 0.1),
              inset 2px 2px 4px rgba(255, 255, 255, 0.5),
              0 0 ${bubble.size}px rgba(142, 202, 230, 0.3)
            `,
            left: `${bubble.left}%`,
            animation: `${styles.bubbleFloat} ${bubble.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}

      {/* 光の屈折レイヤー */}
      <div className={styles.lightRefraction} />

      {/* メインコンテンツ */}
      <div className={styles.content}>
        {/* タイトル - 大胆で印象的に */}
        <h1 className={styles.title}>
          Biotope
          {/* テキストの反射効果 */}
          <span className={styles.titleReflection}>
            Biotope
          </span>
        </h1>

        {/* カスタムローディングアニメーション - 波紋 */}
        <div className={styles.rippleContainer}>
          {/* 中心の水滴 */}
          <div className={styles.droplet} />
          {/* 波紋エフェクト - 複数レイヤー */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={styles.ripple}
              style={{
                border: `${3 - i * 0.5}px solid rgba(142, 202, 230, ${0.7 - i * 0.1})`,
                animationDelay: `${i * 0.8}s`,
                boxShadow: `0 0 ${20 - i * 3}px rgba(142, 202, 230, ${0.5 - i * 0.1})`,
              }}
            />
          ))}
        </div>

        {/* パーセンテージ表示 */}
        <div className={styles.progressContainer}>
          {/* 進捗パーセンテージ */}
          <div className={styles.percentage}>
            {Math.round(progress)}%
          </div>

          {/* ローディングテキスト */}
          <div className={styles.loadingText}>
            {loadingText}
          </div>

          {/* プログレスバー */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* サブタイトル */}
        <p className={styles.subtitle}>
          ビオトープの世界へ
        </p>
      </div>

      {/* 魚の影 - 複数の魚が泳ぐ */}
      <div className={`${styles.fishShadow} ${styles.fishShadow1}`} />
      <div className={`${styles.fishShadow} ${styles.fishShadow2}`} />
      <div className={`${styles.fishShadow} ${styles.fishShadow3}`} />
    </div>
  );
};

export default Loader;
