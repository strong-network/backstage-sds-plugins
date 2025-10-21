// db/DbTokenStore.ts
import { DatabaseService } from '@backstage/backend-plugin-api';

export type ConfigurationSet = {
    entityId: string;
    projectId: string;
    quickTemplateLink: string;
};

export const CONFIG_TABLE_NAME = 'backstage_sds_configuration';

export class DBConfigurationStore {
    constructor(private readonly database: DatabaseService) { }
    private async knex() { return await this.database.getClient(); }

    async get(entityId: string): Promise<ConfigurationSet | undefined> {
        return await (await this.knex())<any>(CONFIG_TABLE_NAME)
            .where('entityId', entityId).first();
    }

    async set(value: ConfigurationSet): Promise<void> {
        const knex = await this.knex();

        const existing = await knex<any>(CONFIG_TABLE_NAME)
            .where('entityId', value.entityId)
            .first();

        const payload = {
            entityId: value.entityId,
            quickTemplateLink: value.quickTemplateLink,
            projectId: value.projectId
        };

        if (existing) {
            await knex<any>(CONFIG_TABLE_NAME)
                .update(payload)
                .where('id', existing.id);
        } else {
            await knex<any>(CONFIG_TABLE_NAME)
                .insert(payload);
        }
    }

    async updateQuickTemplateLink(newLink: string, entityId: string, projectId: string): Promise<void> {
        const knex = await this.knex();
        const existing = await knex<any>(CONFIG_TABLE_NAME)
            .where('entityId', entityId)
            .first();

        if (existing) {
            await knex<any>(CONFIG_TABLE_NAME)
                .update({ quickTemplateLink: newLink, projectId: projectId })
                .where('id', existing.id);
        } else {
            await knex<any>(CONFIG_TABLE_NAME)
                .insert({ quickTemplateLink: newLink, entityId: entityId, projectId: projectId });
        }
    }
}