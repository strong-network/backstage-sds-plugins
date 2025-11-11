import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { PageBlueprint } from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';

import { rootRouteRef } from './routes';
import { WorkspacesApiClient, workspacesApiRef } from './api/api-client';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';



export const sdsWorkspacesPlugin = createPlugin({
  id: 'sds-workspaces',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: workspacesApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, identityApi }) => {
        return new WorkspacesApiClient(discoveryApi, identityApi);
      },
    })
  ],
});

export const sdsWorkspacesPage = PageBlueprint.make({
  params: {
    path: '/sds-workspaces',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('./components/SDSWorkspacesComponent').then(m =>
        compatWrapper(<m.SDSWorkspacesComponent />),
      ),
  }
});


export const sdsWorkspaceCard = EntityCardBlueprint.make({
  name: 'SDSWorkspaceCard',
  params: {
    loader: async () =>
      import('./components/SDSWorkspaceCard').then(m =>
        compatWrapper(<m.SDSWorkspaceCard />),
      ),
  },
});
 
export const sdsWorkspacesTab = EntityCardBlueprint.make({
  name: 'SDSWorkspacesTab',
  params: {
    loader: async () =>
      import('./components/SDSWorkspacesTab').then(m =>
        compatWrapper(<m.SDSWorkspacesTab />),
      ),
  },
});

// old exports
export const SdsWorkspacesPage = sdsWorkspacesPlugin.provide(
  createRoutableExtension({
    name: 'SdsWorkspacesPage',
    component: () =>
      import('./components/SDSWorkspacesComponent').then(m => m.SDSWorkspacesComponent),
    mountPoint: rootRouteRef,
  }),
);

export const SDSWorkspaceCard = sdsWorkspacesPlugin.provide(
  createRoutableExtension({
    name: 'SDSWorkspaceCard',
    component: () =>
      import('./components/SDSWorkspaceCard').then(m => m.SDSWorkspaceCard),
    mountPoint: rootRouteRef,
  }),
);


export const SDSWorkspacesTab = sdsWorkspacesPlugin.provide(
  createRoutableExtension({
    name: 'SDSWorkspacesTab',
    component: () =>
      import('./components/SDSWorkspacesTab').then(m => m.SDSWorkspacesTab),
    mountPoint: rootRouteRef,
  }),
);








