import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const App = lazy(() => import('./App.tsx'))

createRoot(document.getElementById('root')!).render(
  <Suspense
    fallback={
      <div className="boot-loader">
        <div className="boot-loader__content">
          <h1>水辺の四季</h1>
          <p>Mizube no Shiki</p>
        </div>
      </div>
    }
  >
    <App />
  </Suspense>
)
