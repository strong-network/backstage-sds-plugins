// cache/AccessTokenCache.ts
import { CacheService } from '@backstage/backend-plugin-api';

export class AccessTokenCache {
    constructor(private readonly cache: CacheService, private readonly skewSec = 60) { }
    private key(provider: string, userRef: string, scopeKey: string) {
        return `ext-oauth:${provider}:${userRef}:${scopeKey}`;
    }
    async get(provider: string, userRef: string, scopeKey: string) {
        return this.cache.get<string>(this.key(provider, userRef, scopeKey));
    }
    async set(provider: string, userRef: string, scopeKey: string, token: string, expSec: number) {
        const ttlMs = Math.max(0, (expSec * 1000) - Date.now() - this.skewSec * 1000);
        await this.cache.set(this.key(provider, userRef, scopeKey), token, { ttl: ttlMs });
    }
    async delete(provider: string, userRef: string, scopeKey: string) {
        await this.cache.delete(this.key(provider, userRef, scopeKey));
    }
}