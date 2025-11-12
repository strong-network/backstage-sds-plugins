import {
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { compatWrapper, convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { rootRouteRef } from '../routes';
import { WorkspacesApiClient, workspacesApiRef } from '../api/api-client';
import { EntityCardBlueprint, EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

const sdsWorkspaceCard = EntityCardBlueprint.make({
  name: 'SDSWorkspaceCard',
  params: {
    loader: async () =>
      import('../components/SDSWorkspaceCard').then(m =>
        compatWrapper(<m.SDSWorkspaceCard />),
      ),
  },
});

const sdsWorkspacesTab = EntityContentBlueprint.make({
  name: 'SDSWorkspacesTab',
  params: {
    path: '/sds-workspaces',
    title: 'SDS Workspaces',
    loader: async () =>
      import('../components/SDSWorkspacesTab').then(m =>
        compatWrapper(<m.SDSWorkspacesTab />),
      ),
  },
});


const sdsWorkspacesApiFactory = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: workspacesApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, identityApi }) =>
        new WorkspacesApiClient(discoveryApi, identityApi),
    }),
});

export default createFrontendPlugin({
  pluginId: 'sds-workspaces',
  extensions: [sdsWorkspaceCard, sdsWorkspacesTab, sdsWorkspacesApiFactory],
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
});
