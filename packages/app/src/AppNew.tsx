import { createApp } from '@backstage/frontend-defaults';

import { createFrontendModule, githubAuthApiRef, SignInPageBlueprint } from '@backstage/frontend-plugin-api';

import apiDocsPlugin from '@backstage/plugin-api-docs/alpha';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import orgPlugin from '@backstage/plugin-org/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';


import { SignInPage } from '@backstage/core-components';

import sdsWorkspacesPlugin  from '@citrixcloud/backstage-sds-workspaces/alpha';


const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
    (
      <SignInPage
        {...props}
        provider={{
          id: 'github-auth-provider',
          title: 'GitHub',
          message: 'Sign in using GitHub',
          apiRef: githubAuthApiRef,
        }}
      />
    ),
  },
});

const app = createApp({
  // Features such as plugins can be installed explicitly, but we will explore other options later on
  features: [
    catalogPlugin,
    scaffolderPlugin,
    techdocsPlugin,
    apiDocsPlugin,
    orgPlugin,


    sdsWorkspacesPlugin,

    createFrontendModule({
      pluginId: 'app',
      extensions: [signInPage
      ],
    }),
  ],
});


export default app.createRoot();
