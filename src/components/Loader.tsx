import styles from './Loader.module.css';

/**
 * ローディング画面コンポーネント
 * 穏やかに飛び回る蛍と睡蓮の葉の装飾
 */
interface LoaderProps {
  progress?: number; // 0-100
  loadingText?: string;
}

const Loader = ({ progress = 0, loadingText = "読み込み中..." }: LoaderProps) => {
  // 4匹の蛍 - それぞれ独立した経路を持つ
  const fireflies = [
    {
      id: 1,
      pathX: [-30, 20, -10, 30],
      pathY: [-20, 30, -25, 15],
      delay: 0,
      duration: 12
    },
    {
      id: 2,
      pathX: [40, -20, 35, -15],
      pathY: [10, -30, 20, -15],
      delay: 1.5,
      duration: 14
    },
    {
      id: 3,
      pathX: [-35, 25, -25, 35],
      pathY: [25, -20, 30, -25],
      delay: 3,
      duration: 13
    },
    {
      id: 4,
      pathX: [30, -30, 20, -20],
      pathY: [-15, 25, -30, 20],
      delay: 4.5,
      duration: 15
    },
  ];

  // 睡蓮の葉 - 背景装飾
  const lilyPads = [
    { size: 60, left: 15, top: 20, delay: 0 },
    { size: 45, left: 75, top: 65, delay: 1 },
    { size: 50, left: 40, top: 80, delay: 2 },
  ];

  return (
    <div className={styles.container}>
      {/* グラデーション背景 - 夏の夜 */}
      <div className={styles.backgroundGradient} />

      {/* 睡蓮の葉 */}
      {lilyPads.map((lily, i) => (
        <div
          key={i}
          className={styles.lilyPad}
          style={{
            width: `${lily.size}px`,
            height: `${lily.size}px`,
            left: `${lily.left}%`,
            top: `${lily.top}%`,
            animationDelay: `${lily.delay}s`,
          }}
        />
      ))}

      {/* メインコンテンツ */}
      <div className={styles.content}>
        {/* タイトル */}
        <h1 className={styles.title}>
          水辺の四季
        </h1>

        {/* 蛍のアニメーション */}
        <div className={styles.fireflyContainer}>
          {fireflies.map((firefly) => (
            <div
              key={firefly.id}
              className={styles.firefly}
              style={{
                animationDuration: `${firefly.duration}s`,
                animationDelay: `${firefly.delay}s`,
                // @ts-expect-error CSS変数
                '--path-x-0': `${firefly.pathX[0]}%`,
                '--path-x-1': `${firefly.pathX[1]}%`,
                '--path-x-2': `${firefly.pathX[2]}%`,
                '--path-x-3': `${firefly.pathX[3]}%`,
                '--path-y-0': `${firefly.pathY[0]}%`,
                '--path-y-1': `${firefly.pathY[1]}%`,
                '--path-y-2': `${firefly.pathY[2]}%`,
                '--path-y-3': `${firefly.pathY[3]}%`,
              }}
            >
              {/* 蛍の発光体 */}
              <div className={styles.fireflyGlow} />
            </div>
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
          Mizube no Shiki
        </p>
      </div>
    </div>
  );
};

export default Loader;
