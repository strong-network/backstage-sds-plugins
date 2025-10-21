import { createDevApp } from '@backstage/dev-utils';
import { sdsWorkspacesPlugin, SdsWorkspacesPage } from '../src/plugin';

createDevApp()
  .registerPlugin(sdsWorkspacesPlugin)
  .addPage({
    element: <SdsWorkspacesPage />,
    title: 'Root Page',
    path: '/sds-workspaces',
  })
  .render();
