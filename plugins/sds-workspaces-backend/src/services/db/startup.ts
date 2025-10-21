// db/bootstrap.ts
import { DatabaseService } from '@backstage/backend-plugin-api';
import { ТАBLE_NAME } from './DBTokenStore';
import { CONFIG_TABLE_NAME } from './DBConfigurationStore';

export async function ensureDBTables(database: DatabaseService) {
    const knex = await database.getClient();
    if (!(await knex.schema.hasTable(ТАBLE_NAME))) {
        await knex.schema.createTable(ТАBLE_NAME, t => {
            t.text('k').primary();
            t.text('tokenset_cipher').notNullable();
            t.bigInteger('expires_at').notNullable();
            t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
        });
    }

    await knex.raw(`CREATE INDEX IF NOT EXISTS ${ТАBLE_NAME}_expires_idx ON ${ТАBLE_NAME} (expires_at);`);


    if (!(await knex.schema.hasTable(CONFIG_TABLE_NAME))) {
        await knex.schema.createTable(CONFIG_TABLE_NAME, t => {
            t.increments('id').primary();
            t.text('entityId').notNullable().defaultTo('');
            t.text('projectId').notNullable().defaultTo('');
            t.text('quickTemplateLink').notNullable().defaultTo('');
            t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
        });
    }


}

