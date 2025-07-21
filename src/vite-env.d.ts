/// <reference types="vite/client" />

declare module '*.gltf' {
  const src: string;
  export default src;
}

declare module '*.bin' {
  const src: string;
  export default src;
}
