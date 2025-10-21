import {
  CacheService,
  DatabaseService,
  HttpAuthService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { Request, Router } from 'express';
import { AccessTokenCache } from './services/cache/AccessTokenCache';
import { DbTokenStore } from './services/db/DBTokenStore';
import { ensureDBTables } from './services/db/startup';
import { makeEnsureAccessToken, sds_provider } from './services/db/token';

const userRedirectMap = new Map<string, string>();
const stateSecret = randomBytes(32).toString('hex');

function nowSec() {
  return Math.floor(Date.now() / 1000);
}
function safeExp(expires_in?: number) {
  return nowSec() + Math.max(30, (expires_in ?? 3600) - 60);
}

export type TokenSet = {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  scope?: string;
  token_type?: string;
  platform?: string;
};

function signState(payload: string) {
  const sig = createHmac('sha256', stateSecret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyState(state: string) {
  const idx = state.lastIndexOf('.');
  if (idx < 0) return null;
  const payload = state.slice(0, idx);
  const sig = state.slice(idx + 1);
  const vsig = createHmac('sha256', stateSecret).update(payload).digest('hex');
  return timingSafeEqual(Buffer.from(sig), Buffer.from(vsig)) ? payload : null;
}

export const registerOAuthRoutes = async ({
  router,
  httpAuth,
  config,
  database,
  cache,
  logger,
}: {
  router: Router;
  httpAuth: HttpAuthService;
  config: RootConfigService;
  database: DatabaseService;
  cache: CacheService;
  logger: { info: (m: string) => void; error: (m: string) => void };
}) => {
  const clientId = config.getString('sdsWorkspaces.authClientId');

  const clientSecret =
    config.getOptionalString('sdsWorkspaces.authClientSecret') ?? '';

  const platformUrl =
    config.getOptionalString('sdsWorkspaces.platformURL') ?? '';

  const redirectUri = `${config.getString(
    'backend.baseUrl',
  )}/api/sds-workspaces/oauth/callback`;
  const defaultRedirectBackUri = `${config.getString(
    'app.baseUrl',
  )}/sds-workspaces`;

  const getAuthorizeUrl = () => `${platformUrl}/oauth/authorize`;
  const getTokenUrl = () => (platformUrl ? `${platformUrl}/oauth/token` : null);

  ensureDBTables(database).catch(e =>
    logger.error(`ensureDBTables failed: ${e?.message}`),
  );

  const tokenRepo = new DbTokenStore(database);

  const atCache = new AccessTokenCache(cache, 60);

  const ensureAT = await makeEnsureAccessToken({
    tokenRepo,
    atCache,
    clientId,
  });

  const getAccessToken = async (req: Request) => {
    const { principal } = await httpAuth.credentials(req);
    const typedPrincipal = principal as {
      userEntityRef?: string;
      subject?: string;
    };
    const userRef =
      typedPrincipal.userEntityRef ?? typedPrincipal.subject ?? 'unknown';

    const tokenUrl = getTokenUrl();
    if (!tokenUrl) {
      return null;
    }

    return await ensureAT(userRef, tokenUrl);
  };

  router.get('/session/me', async (req, res) => {
    const { principal } = await httpAuth.credentials(req);
    const typedPrincipal = principal as {
      userEntityRef?: string;
      subject?: string;
    };
    const userRef =
      typedPrincipal.userEntityRef ?? typedPrincipal.subject ?? 'unknown';

    const access = await getAccessToken(req);
    if (!access) return res.status(401).json({ error: 'Not connected' });

    return res.json({
      token: access,
      connected: true,
      user: userRef,
      subject: userRef,
    });
  });

  router.post('/session/connect', async (req, res) => {
    const { principal } = await httpAuth.credentials(req);

    const typedPrincipal = principal as {
      userEntityRef?: string;
      subject?: string;
    };
    const userRef =
      typedPrincipal.userEntityRef ?? typedPrincipal.subject ?? 'unknown';

    const payload = JSON.stringify({ userRef, ts: Date.now() });
    const state = signState(Buffer.from(payload).toString('base64url'));

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
    });

    userRedirectMap.set(
      userRef,
      req.body?.redirectUrl ?? defaultRedirectBackUri,
    );

    const url = `${getAuthorizeUrl()}?${params.toString()} `;
    return res.json({ url });
  });

  router.post('/session/logout', async (req, res) => {
    const { principal } = await httpAuth.credentials(req);
    const typedPrincipal = principal as {
      userEntityRef?: string;
      subject?: string;
    };
    const userRef = typedPrincipal.userEntityRef ?? typedPrincipal.subject;
    if (userRef) {
      await tokenRepo.delete(userRef);
      await atCache.delete(sds_provider, userRef, '');
    }
    return res.status(204).end();
  });

  // OAuth callback
  router.get('/oauth/callback', async (req, res) => {
    try {
      const { code, state } = req.query as { code?: string; state?: string };
      if (!code) return res.status(400).send('Missing code');

      if (!state) return res.status(400).send('Missing state');

      const payloadB64 = verifyState(state);
      if (!payloadB64) return res.status(400).send('Bad state');

      const payload = JSON.parse(
        Buffer.from(payloadB64, 'base64url').toString('utf8'),
      ) as { userRef: string; ts: number };
      const userRef = payload.userRef;

      // Exchange code for tokens
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const tokenUrl = getTokenUrl();
      if (!tokenUrl) {
        return res.status(500).send('Token URL is not configured');
      }

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!tokenResponse.ok) {
        const txt = await tokenResponse.text().catch(() => '');
        return res
          .status(502)
          .send(`Token exchange failed: ${tokenResponse.status} ${txt} `);
      }

      const token = (await tokenResponse.json()) as {
        access_token: string;
        refresh_token?: string;
        token_type?: string;
        expires_in?: number;
        scope?: string;
      };

      await tokenRepo.set(userRef, {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        token_type: token.token_type,
        expires_at: safeExp(token.expires_in),
        platform: platformUrl,
      } as TokenSet);
      await atCache.set(
        sds_provider,
        userRef,
        '',
        token.access_token,
        safeExp(token.expires_in),
      );

      const target = userRedirectMap.get(userRef) ?? defaultRedirectBackUri;

      return res.redirect(302, target);
    } catch (e: any) {
      console.error(`oauth / callback error: ${e?.message} `);
      return res.status(500).send('OAuth callback error');
    }
  });

  return getAccessToken;
};
