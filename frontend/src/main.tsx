import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {RouterProvider, createRouter} from '@tanstack/react-router'

import {routeTree} from './routeTree.gen'

import './index.css'
import {resetAllStores} from './stores'

const router = createRouter({routeTree})
router.subscribe('onBeforeLoad', () => {
  resetAllStores()
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
