import {
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { rootRouteRef } from '../routes';
import { sdsWorkspaceCard, sdsWorkspacesTab } from '../plugin';
import { WorkspacesApiClient, workspacesApiRef } from '../api/api-client';

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
