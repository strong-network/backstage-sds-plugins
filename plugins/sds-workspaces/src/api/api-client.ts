import { createApiRef, DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';

export const workspacesApiRef = createApiRef<WorkspacesApi>({ id: 'plugin.workspaces.api' });

export type Workspace = {
    name: string;
    workspaceId: number;
    owner: string;
    url?: string;
};

export interface WorkspacesApi {
    connect(url: string): Promise<{ connected: boolean }>;
    logout(): Promise<void>;
    me(): Promise<{ connected: boolean; user: string }>;

    listWorkspaces(): Promise<Workspace[]>;
    updateWorkspaceState(projectId: string, workspaceId: number, state: string): Promise<void>;

    getUserInfo(): Promise<{ user: string; subject: string }>;
    saveQuickLink(link: string, entityId: string, projectId: string): Promise<{ success: boolean }>;

    getConfiguration(entityId?: string): Promise<{ entityId: string; projectId: string; quickTemplateLink: string } | undefined>;
}

export class WorkspacesApiClient implements WorkspacesApi {
    constructor(
        private readonly discoveryApi: DiscoveryApi,
        private readonly identityApi: IdentityApi,
    ) { }
    private async call(path: string, init?: RequestInit) {
        const base = await this.discoveryApi.getBaseUrl('sds-workspaces');
        const { token } = await this.identityApi.getCredentials();

        const res = await fetch(`${base}${path}`, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...init?.headers,
            },
            credentials: 'include'
        });
        if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
        if (res.status === 204) return {};
        return res.json();
    }
    connect() { return this.call('/session/connect', { method: 'POST', body: JSON.stringify({ redirectUrl: window.location.href }) }); }
    me() { return this.call('/session/me'); }

    async listWorkspaces() { return (await this.call('/workspaces')).workspaces; }
    async updateWorkspaceState(projectId: string, workspaceId: number, state: string) {
        return await this.call('/update_state', { method: 'POST', body: JSON.stringify({ projectId: +projectId, workspaceId: workspaceId, state: state }) });
    }
    async getUserInfo() { return (await this.call('/user_info')).data; }
    async saveQuickLink(link: string, entityId: string, projectId: string) {
        return await
            this.call('/save_quick_link',
                {
                    method: 'POST', body: JSON.stringify({ link: link, entityId: entityId, projectId: projectId })
                });
    }
    async getConfiguration(entityId?: string) {
        let query = '';

        const searchParams = new URLSearchParams();
        if (entityId) searchParams.append('entityId', entityId);
        query = `?${searchParams.toString()}`;
        return (await this.call(`/configuration${query}`)).config;
    }
    logout() { return this.call('/session/logout', { method: 'POST' }); }
}