import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { registerOAuthRoutes } from './auth';
import { json, Router } from 'express';



/**
 * sdsWorkspacesPlugin backend plugin
 *
 * @public
 */
export const sdsWorkspacesPlugin = createBackendPlugin({
  pluginId: 'sds-workspaces',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        cache: coreServices.cache,
        config: coreServices.rootConfig,
        database: coreServices.database,
      },
      async init({ logger, httpAuth, httpRouter, database, config, cache }) {

        const router = Router();
        router.use(json());


        const getAccessToken = await registerOAuthRoutes({ router, httpAuth, config, database, cache, logger });


        const pluginRoute = await createRouter({
          router,
          config,
          database,
          getAccessToken
        })

        httpRouter.use(
          pluginRoute
        );

        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });

        httpRouter.addAuthPolicy({
          path: '/oauth/callback',
          allow: 'unauthenticated',
        });

      },
    });
  },
});

