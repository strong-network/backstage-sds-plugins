// db/DbTokenStore.ts
import { DatabaseService } from '@backstage/backend-plugin-api';
import { encode, decode } from './encode';
import { TokenSet } from '../../auth';

export const ТАBLE_NAME = 'backstage_sds_tokens';

export class DbTokenStore {
  constructor(private readonly database: DatabaseService) {}
  private async knex() {
    return await this.database.getClient();
  }

  async get(key: string): Promise<TokenSet | undefined> {
    const row = await (await this.knex())<any>(ТАBLE_NAME)
      .where({ k: key })
      .first();
    return row ? decode<TokenSet>(row.tokenset_cipher) : undefined;
  }

  async set(key: string, value: TokenSet): Promise<void> {
    const payload = {
      k: key,
      tokenset_cipher: encode(value),
      expires_at: value.expires_at,
      updated_at: (await this.knex()).fn.now(),
    };
    await (await this.knex())<any>(ТАBLE_NAME)
      .insert(payload)
      .onConflict('k')
      .merge({
        tokenset_cipher: payload.tokenset_cipher,
        expires_at: payload.expires_at,
        updated_at: payload.updated_at,
      });
  }

  async delete(key: string): Promise<void> {
    await (await this.knex())<any>(ТАBLE_NAME).where({ k: key }).delete();
  }

  async isValid(key: string, skewSec = 60): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000) + skewSec;
    const row = await (await this.knex())<any>(ТАBLE_NAME)
      .where({ k: key })
      .andWhere('expires_at', '>', now)
      .first('k');
    return !!row;
  }
}
