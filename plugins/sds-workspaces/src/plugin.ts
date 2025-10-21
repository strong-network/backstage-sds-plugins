import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { WorkspacesApiClient, workspacesApiRef } from './api/api-client';

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





