import * as React from 'react'
import {Outlet, createRootRoute} from '@tanstack/react-router'
import {NavCard} from '../components/nav'
import {ProgressModal} from '../components/progress.modal'
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <React.Fragment>
      <Outlet />
      <NavCard />
      <ProgressModal />
      {/* <TanStackRouterDevtools position='bottom-right'/> */}
    </React.Fragment>
  ),
})
