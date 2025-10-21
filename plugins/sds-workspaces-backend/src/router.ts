import {
  DatabaseService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { Request, Router } from 'express';
import {
  ConfigurationSet,
  DBConfigurationStore,
} from './services/db/DBConfigurationStore';

export async function createRouter({
  router,
  config,
  database,
  getAccessToken,
}: {
  router: Router;
  config: RootConfigService;
  database: DatabaseService;
  getAccessToken: (req: Request) => Promise<string | null>;
}): Promise<Router> {
  const platformURL =
    config.getOptionalString('sdsWorkspaces.platformURL') ?? '';
  const configDBRepo = new DBConfigurationStore(database);

  router.get('/health', async (_req, res) => {
    return res.json({ msg: 'OK' });
  });

  router.get('/workspaces', async (req, res) => {
    const access = await getAccessToken(req);

    if (!access) return res.status(401).json({ error: 'Not connected' });

    const r = await fetch(`${platformURL}/v1/personal_workspaces`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (!r.ok) {
      return res
        .status(502)
        .json({ error: 'Failed to fetch workspaces from platform' });
    }

    const data = await r.json();
    const workspaces = data.workspaces || [];

    return res.json({ ok: true, workspaces: workspaces });
  });

  router.get('/user_info', async (req, res) => {
    const access = await getAccessToken(req);
    if (!access) return res.status(401).json({ error: 'Not connected' });

    const r = await fetch(`${platformURL}/v1/user_info`, {
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${access}`,
      },
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(502).json({ error: 'Failed to fetch user info' });
    }

    return res.json({ ok: true, data: data });
  });

  router.post('/update_state', async (req, res) => {
    const access = await getAccessToken(req);
    if (!access) return res.status(401).json({ error: 'Not connected' });

    const payload = req.body;

    const { projectId, workspaceId, state } = payload;
    if (!projectId || !workspaceId || !state) {
      return res
        .status(400)
        .json({ error: 'Missing projectId or workspaceId or state' });
    }

    const r = await fetch(
      `${platformURL}/v1/projects/${projectId}/workspaces/${workspaceId}/state`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ state: state }),
      },
    );
    if (!r.ok) {
      return res
        .status(502)
        .json({ error: 'Failed to update workspace state' });
    }

    return res.json({ ok: true });
  });

  // INTERNAL ROUTES
  router.post('/save_quick_link', async (req, res) => {
    const { link, entityId, projectId } = req.body;
    if (
      typeof link !== 'string' ||
      typeof entityId !== 'string' ||
      typeof projectId !== 'string'
    ) {
      return res.status(400).json({ error: 'Missing link' });
    }

    await configDBRepo.updateQuickTemplateLink(link, entityId, projectId);

    return res.json({ ok: true });
  });

  router.get('/configuration', async (req, res) => {
    const { entityId } = req.query;

    const configuration = await configDBRepo.get(
      typeof entityId === 'string' ? entityId : '',
    );

    return res.json({
      ok: true,
      config: configuration || ({} as ConfigurationSet),
    });
  });

  return router;
}
