import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

// Chrome固有のメモリAPI型定義
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// グローバル型の拡張
declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }

  interface Window {
    __performanceStats?: PerformanceStats;
  }
}

interface PerformanceStats {
  fps: number;
  frameTime: number;
  triangles: number;
  calls: number;
  memory?: number;
}

/**
 * Canvas内でパフォーマンスデータを収集するコンポーネント
 */
export const PerformanceMonitorCollector: React.FC = () => {
  const { gl } = useThree();
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    triangles: 0,
    calls: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const frameTimeAccumulator = useRef(0);

  useFrame(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime.current;

    frameCount.current++;
    frameTimeAccumulator.current += deltaTime;

    // 0.5秒ごとに統計を更新
    if (frameTimeAccumulator.current >= 500) {
      const fps = Math.round((frameCount.current * 1000) / frameTimeAccumulator.current);
      const avgFrameTime = frameTimeAccumulator.current / frameCount.current;

      const info = gl.info;
      const memory = performance.memory;

      setStats({
        fps,
        frameTime: Math.round(avgFrameTime * 100) / 100,
        triangles: info.render.triangles,
        calls: info.render.calls,
        memory: memory ? Math.round((memory.usedJSHeapSize / 1048576) * 100) / 100 : undefined,
      });

      frameCount.current = 0;
      frameTimeAccumulator.current = 0;
    }

    lastTime.current = currentTime;
  });

  useEffect(() => {
    // statsをグローバルに保存（ContextではなくWindowオブジェクト経由）
    window.__performanceStats = stats;
  }, [stats]);

  return null; // Canvas内では何も描画しない
};

/**
 * Canvas外でパフォーマンス統計を表示するコンポーネント
 */
export const PerformanceMonitorDisplay: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    triangles: 0,
    calls: 0,
  });

  useEffect(() => {
    if (!enabled) return;

    // 定期的にwindowから統計を取得
    const interval = setInterval(() => {
      const globalStats = window.__performanceStats;
      if (globalStats) {
        setStats(globalStats);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#00ff00',
        padding: '10px 15px',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '5px',
        zIndex: 1000,
        minWidth: '200px',
        pointerEvents: 'none',
      }}
    >
      <div style={{ marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
        Performance Stats
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span>FPS:</span>
        <span style={{ color: stats.fps >= 60 ? '#00ff00' : stats.fps >= 30 ? '#ffff00' : '#ff0000' }}>
          {stats.fps}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span>Frame Time:</span>
        <span>{stats.frameTime.toFixed(2)} ms</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span>Draw Calls:</span>
        <span>{stats.calls}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span>Triangles:</span>
        <span>{stats.triangles.toLocaleString()}</span>
      </div>
      {stats.memory !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Memory:</span>
          <span>{stats.memory} MB</span>
        </div>
      )}
    </div>
  );
};

// 後方互換性のため、デフォルトエクスポートはDisplayコンポーネント
export const PerformanceMonitor = PerformanceMonitorDisplay;

export default PerformanceMonitor;
