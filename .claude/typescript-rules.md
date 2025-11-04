# TypeScript ルール

## 絶対禁止

### ❌ `any` 型の使用
```typescript
// ❌ ダメな例
const data: any = fetchData();
const handleClick = (e: any) => {};

// ✅ 良い例
interface FetchResponse {
  message: string;
  date: string;
}
const data: FetchResponse = fetchData();
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
```

### ❌ 型アサーションの乱用
```typescript
// ❌ ダメな例
const value = data as any;

// ✅ 良い例
const value = data as FetchResponse;
// または型ガードを使う
if (typeof data === 'object' && 'message' in data) {
  // ...
}
```

### ❌ `@ts-ignore` や `@ts-expect-error`
```typescript
// ❌ ダメな例
// @ts-ignore
const result = dangerousFunction();

// ✅ 良い例
// 適切な型定義を追加するか、型ガードを使う
```

## 推奨される型定義

### Props の型定義
```typescript
// ✅ インターフェースで定義
interface MessageCardProps {
  message: string;
  sender: string;
  onClose: (e: React.MouseEvent) => void;
}

export const MessageCard = memo(({ message, sender, onClose }: MessageCardProps) => {
  // ...
});
```

### イベントハンドラー
```typescript
// ✅ React の型を使用
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation();
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};
```

### API レスポンス
```typescript
// ✅ レスポンス型を定義
interface DailyMessageResponse {
  date: string;
  dateDescription: string;
  message: string;
  generatedAt: string;
}

const response = await fetch('/api/daily-message');
const data: DailyMessageResponse = await response.json();
```

### Ref の型
```typescript
// ✅ 明示的な型指定
const meshRef = useRef<THREE.Mesh>(null);
const divRef = useRef<HTMLDivElement>(null);
```

### State の型
```typescript
// ✅ ジェネリクスで型指定
const [message, setMessage] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(false);

// 複雑な状態
interface BottleState {
  isOpen: boolean;
  message: string | null;
  sender: string | null;
}
const [bottleState, setBottleState] = useState<BottleState>({
  isOpen: false,
  message: null,
  sender: null,
});
```

## ユーティリティ型の活用

### Record型
```typescript
// ✅ キーと値の型を定義
type Season = "spring" | "summer" | "autumn" | "winter";
type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

const messages: Record<Season, Record<TimeOfDay, string[]>> = {
  spring: {
    morning: ["..."],
    // ...
  },
  // ...
};
```

### Readonly
```typescript
// ✅ 読み取り専用配列
export const SENDERS = [
  "漂流者より",
  "遠い島の住人より",
  // ...
] as const;

// 型: readonly ["漂流者より", "遠い島の住人より", ...]
```

### Partial / Required
```typescript
// ✅ オプショナルな更新
interface Settings {
  volume: number;
  brightness: number;
}

const updateSettings = (updates: Partial<Settings>) => {
  // ...
};
```

## Three.js の型

### Mesh と Group
```typescript
import * as THREE from 'three';

// ✅ THREE の型を使用
const meshRef = useRef<THREE.Mesh>(null);
const groupRef = useRef<THREE.Group>(null);
const materialRef = useRef<THREE.MeshStandardMaterial>(null);
```

### useFrame
```typescript
import { useFrame } from '@react-three/fiber';

// ✅ 引数の型は省略可能（型推論が効く）
useFrame((state, delta) => {
  if (meshRef.current) {
    meshRef.current.rotation.y += delta;
  }
});
```

## Cloudflare Functions の型

### 環境変数
```typescript
// ✅ Env インターフェース定義
interface Env {
  GEMINI_API_KEY: string;
}

export const onRequest = async (
  context: EventContext<Env, string, Record<string, unknown>>
) => {
  const apiKey = context.env.GEMINI_API_KEY; // string型
};
```

### API レスポンス
```typescript
// ✅ 外部APIのレスポンス型定義
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const data: GeminiResponse = await response.json();
const text = data.candidates[0].content.parts[0].text; // string型
```

## 型ガード

### カスタム型ガード
```typescript
// ✅ 型ガード関数
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

try {
  // ...
} catch (error) {
  if (isError(error)) {
    console.error(error.message); // Error型として扱える
  }
}
```

### in 演算子
```typescript
// ✅ プロパティの存在チェック
if ('message' in data && typeof data.message === 'string') {
  console.log(data.message);
}
```

## 型の再利用

### 型のエクスポート
```typescript
// utils/time.ts
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

// 他のファイルで使用
import type { TimeOfDay } from "../utils/time";
```

### 型の拡張
```typescript
// ✅ 既存の型を拡張
interface BaseProps {
  id: string;
}

interface ExtendedProps extends BaseProps {
  name: string;
  age: number;
}
```

## strictモード

### tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

## よくあるエラーと対処法

### Object is possibly 'null'
```typescript
// ❌ ダメ
meshRef.current.rotation.y += 0.1;

// ✅ 良い
if (meshRef.current) {
  meshRef.current.rotation.y += 0.1;
}

// ✅ または
meshRef.current?.rotation && (meshRef.current.rotation.y += 0.1);
```

### Type 'string | undefined'
```typescript
// ❌ ダメ
const value: string = data.message;

// ✅ 良い
const value: string = data.message ?? 'デフォルト値';

// ✅ または
if (data.message) {
  const value: string = data.message;
}
```

### Element implicitly has an 'any' type
```typescript
// ❌ ダメ
const items = ['a', 'b', 'c'];
const item = items[index]; // any型

// ✅ 良い
const items: string[] = ['a', 'b', 'c'];
const item: string | undefined = items[index];
```

## まとめ

1. **絶対に `any` を使わない**
2. **明示的な型定義を心がける**
3. **型推論を活用する**
4. **型ガードで安全性を確保**
5. **strict モードを有効にする**
