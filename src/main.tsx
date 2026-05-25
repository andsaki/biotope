import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const App = lazy(() => import('./App.tsx'))

createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<div className="boot-loader" />}>
    <App />
  </Suspense>
)
