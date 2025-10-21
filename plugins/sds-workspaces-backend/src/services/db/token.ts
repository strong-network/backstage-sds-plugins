// tokens.ts
import { TokenSet } from '../../auth';
import { AccessTokenCache } from '../cache/AccessTokenCache';
import { DbTokenStore } from './DBTokenStore';

export const sds_provider = 'sds_backstage';

export function nowSec() { return Math.floor(Date.now() / 1000); }
export function safeExp(expires_in?: number) { return nowSec() + Math.max(30, (expires_in ?? 3600) - 60); }

export async function makeEnsureAccessToken(
    opts: {
        tokenRepo: DbTokenStore,
        atCache?: AccessTokenCache,         // optional but recommended
        clientId: string,
        scopeKey?: (ts?: TokenSet) => string, // optional: how you key scopes
    }
) {
    const { tokenRepo, atCache, clientId } = opts;
    const scopeKeyFn = opts.scopeKey ?? (ts => ts?.scope ?? '');

    return async function ensureAccessToken(userRef: string, tokenUrl: string): Promise<string | null> {
        const key = `${sds_provider}:${userRef}:${''}`; // include scopeKey if you vary by scope
        // 1) try cache
        if (atCache) {
            const cached = await atCache.get(sds_provider, userRef, '');
            if (cached) return cached;
        }
        // 2) load from DB
        const cur = await tokenRepo.get(userRef);
        if (!cur) return null;

        // 3) still valid? cache and return
        if (cur.expires_at > nowSec()) {
            if (atCache) await atCache.set(sds_provider, userRef, scopeKeyFn(cur), cur.access_token, cur.expires_at);
            return cur.access_token;
        }

        // 4) refresh if possible
        if (!cur.refresh_token) return null;

        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: cur.refresh_token,
            client_id: clientId,
        });

        const r = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });

        if (!r.ok) {
            await tokenRepo.delete(key);
            if (atCache) await atCache.delete(sds_provider, userRef, scopeKeyFn(cur));
            return null;
        }

        const tj = await r.json() as { access_token: string; refresh_token?: string; expires_in?: number; scope?: string; token_type?: string };

        const updated: TokenSet = {
            access_token: tj.access_token,
            refresh_token: tj.refresh_token ?? cur.refresh_token,
            token_type: tj.token_type ?? cur.token_type,
            scope: tj.scope ?? cur.scope,
            expires_at: safeExp(tj.expires_in),
        };

        await tokenRepo.set(key, updated);
        if (atCache) await atCache.set(sds_provider, userRef, scopeKeyFn(updated), updated.access_token, updated.expires_at);
        return updated.access_token;
    };
}