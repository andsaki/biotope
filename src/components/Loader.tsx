import { motion } from 'framer-motion';
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
    { delay: 0, x: [0, 30, -20, 10, 0], y: [0, -25, -15, -30, 0], duration: 4 },
    { delay: 0.5, x: [0, -25, 15, -10, 0], y: [0, -20, -35, -15, 0], duration: 4.5 },
    { delay: 1, x: [0, 20, -30, 5, 0], y: [0, -30, -10, -25, 0], duration: 5 },
    { delay: 1.5, x: [0, -15, 25, -5, 0], y: [0, -15, -25, -35, 0], duration: 4.2 },
  ];

  return (
    <div className={styles.container}>
      {/* グラデーション背景 - 夏の夜 */}
      <div className={styles.backgroundGradient} />

      {/* 睡蓮の葉（背景装飾） */}
      <div className={styles.lilyPad} />

      {/* メインコンテンツ */}
      <div className={styles.content}>
        {/* タイトル */}
        <h1 className={styles.title}>
          水辺の四季
        </h1>

        {/* 蛍のアニメーション */}
        <div className={styles.fireflyContainer}>
          {fireflies.map((firefly, index) => (
            <motion.div
              key={index}
              className={styles.firefly}
              animate={{
                x: firefly.x,
                y: firefly.y,
                opacity: [0.3, 1, 0.3, 1, 0.3], // 点滅効果
              }}
              transition={{
                x: {
                  duration: firefly.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: firefly.delay,
                },
                y: {
                  duration: firefly.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: firefly.delay,
                },
                opacity: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: firefly.delay,
                },
              }}
            >
              {/* 蛍の発光体 */}
              <div className={styles.fireflyGlow} />
            </motion.div>
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
