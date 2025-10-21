import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useApi, discoveryApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { WorkspacesApiClient } from '../api/api-client';
import { WS } from '../components/WorkspaceList/WorkspaceList';

type Configuration = {
    projectId: string;
    quickTemplateLink: string;
    entityId: string;
}

type SDSContextState = {
    loading: boolean;
    connected: boolean;
    user?: string;
    subject?: string;
    error?: string | null;
    userInfo?: any;
    isAdmin?: boolean;
    configuration?: Configuration;
    quickTemplateLink: string;
    workspaces: WS[];
    setLoading: (loading: boolean) => void;
    fetchWorkspaces: () => Promise<void>;
    fetchConfiguration: (entityId: string) => Promise<Configuration>;
    saveTemplateLink: (link: string, entityId: string) => void;
    refresh: () => Promise<void>;
    connect: () => Promise<void>;
    logout: () => Promise<void>;
    getUserInfo: () => Promise<void>;
};

const getProjectId = (url: string) => {
    const match = url.match(/project\/(\d+)\/quickstart/);
    return match ? match[1] : "";
}

const Ctx = createContext<SDSContextState | undefined>(undefined);

export const SdsWorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const discoveryApi = useApi(discoveryApiRef);
    const identityApi = useApi(identityApiRef);
    const api = useMemo(() => new WorkspacesApiClient(discoveryApi, identityApi), [discoveryApi, identityApi]);

    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [user, setUser] = useState<string | undefined>();
    const [subject, setSubject] = useState<string | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [quickTemplateLink, setQuickTemplateLink] = useState<string>('');
    const [configuration, setConfiguration] = useState<any>(null);
    const [workspaces, setWorkspaces] = useState<WS[]>([]);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const me: any = await api.me();
            setConnected(!!me.connected);
            setUser(me.user);
            setSubject(me.subject);
        } catch (e: any) {
            setError(e.message ?? String(e));
            setConnected(false);
            setUser(undefined);
            setSubject(undefined);
        } finally {
            setLoading(false);
        }
    }, [api]);

    const connect = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { url } = await api.connect();
        window.location.href = url; // browser continues the OAuth flow
    }, [api]);

    const logout = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await api.logout();
            await refresh();
        } catch (e: any) {
            setError(e.message ?? String(e));
            setLoading(false);
        }
    }, [api, refresh]);


    const getUserInfo = useCallback(async () => {
        setError(null);
        try {
            const info = await api.getUserInfo();
            setUserInfo(info);
            setIsAdmin(info?.fullName === "Admin");
        } catch (e: any) {
            setError(e.message ?? String(e));
            setUserInfo(null);
        }
    }, [api]);

    const fetchWorkspaces = useCallback(async () => {
        try {
            const wss = await api.listWorkspaces();
            setWorkspaces(wss);
        } catch (e: any) {
            setError(e.message ?? String(e));
            setWorkspaces([]);
        }
    }, [api]);

    const fetchConfiguration = useCallback(async (entityId: string) => {
        setLoading(true);
        const config = await api.getConfiguration(entityId);
        setConfiguration(config);
        setQuickTemplateLink(config?.quickTemplateLink || '');
        setLoading(false);
        return config;
    }, [api]);

    const saveTemplateLink = useCallback(
        async (link: string, entityId: string) => {
            await api.saveQuickLink(link, entityId, getProjectId(link));
            await fetchConfiguration(entityId);
        },
        [api, fetchConfiguration]
    );


    useEffect(() => { refresh(); }, [refresh]);

    const value: SDSContextState = {
        loading, connected, user, subject, error, userInfo, isAdmin, configuration, quickTemplateLink, workspaces, setLoading,
        refresh, connect, logout, getUserInfo, saveTemplateLink, fetchConfiguration, fetchWorkspaces
    };
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useSdsWorkspaceContext = () => {
    const v = useContext(Ctx);
    if (!v) throw new Error('useSdsWorkspaceContext must be used within SdsWorkspaceProvider');
    return v;
};