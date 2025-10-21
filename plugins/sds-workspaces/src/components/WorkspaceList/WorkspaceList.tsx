import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApi, discoveryApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { InfoCard, Progress } from '@backstage/core-components';
import { WorkspacesApiClient } from '../../api/api-client';
import { useSdsWorkspaceContext } from '../../context/SDSWorkspaceContext';
import { Button, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';

export type WS = {
    workspaceId: number;
    workspaceName: string;
    projectId: string;
    projectName: string;
    organizationName: string;
    state: string;
    workspaceUrl: string;
};
type WorkspaceListProps = {
    innerCard?: boolean;
};

export const WorkspaceList: React.FC<WorkspaceListProps> = ({ innerCard }) => {
    const { connected, quickTemplateLink, configuration, loading, workspaces, getUserInfo, logout, fetchWorkspaces, setLoading } = useSdsWorkspaceContext();
    const discoveryApi = useApi(discoveryApiRef);
    const identityApi = useApi(identityApiRef);
    const api = useMemo(() => new WorkspacesApiClient(discoveryApi, identityApi), [discoveryApi, identityApi]);

    const [rows, setRows] = useState<WS[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [_projectId, setProjectId] = useState<string>('');

    const load = useCallback(async () => {
        await fetchWorkspaces();
    }, [fetchWorkspaces]);

    const loadRows = useCallback(async () => {
        setRows(workspaces.filter(ws => (configuration?.projectId ? ws.projectId === configuration.projectId : false)));
    }, [workspaces, configuration]);


    const changeWorkspaceState = useCallback(
        async (ws: WS, nextState: string) => {
            try {
                setError(null);

                await api.updateWorkspaceState(
                    ws.projectId,
                    ws.workspaceId,
                    nextState,
                );
                await load();
            } catch (e: any) {
                setError(e?.message ?? 'Failed to update workspace state');
            }
        },
        [api, load]
    );

    useEffect(() => {
        loadRows();
    }, [workspaces, loadRows, configuration]);


    // initial + on connected change
    useEffect(() => {
        setLoading(true);

        load();
        getUserInfo();
        setProjectId(configuration?.projectId ?? '');

        setLoading(false);
    }, [load, getUserInfo, setLoading, configuration]);

    // poll every 5s, only when connected
    useEffect(() => {
        if (connected) {
            const id = setInterval(() => { load(); }, 5000);
            return () => clearInterval(id);
        }
        return undefined;
    }, [connected, load]);

    if (!connected) return null;

    return (
        <div
        >
            <InfoCard
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Citrix Secure Developer Spaces</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

                            {innerCard && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    onClick={logout}
                                    style={{ marginLeft: 8 }}
                                >
                                    Logout
                                </Button>)}
                        </div>
                    </div>
                }
                subheader={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span>Your workspaces across projects and organizations</span>
                        {quickTemplateLink && (
                            <Button
                                variant="outlined"
                                href={quickTemplateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontSize: 14,
                                    textAlign: 'right',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Create Workspace
                            </Button>
                        )}
                    </div>
                }
            >
                {loading && <Progress />}
                {!loading && error && <div style={{ color: '#c00' }}>{error}</div>}

                {!loading && !error && connected && (
                    <>
                        <TableContainer component={Paper} elevation={0}>
                            <Table size="small" aria-label="workspaces table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Workspace Name</TableCell>
                                        <TableCell>Project</TableCell>
                                        <TableCell>Organization</TableCell>
                                        <TableCell>State</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((ws) => (
                                        <TableRow key={ws.workspaceId} style={{ height: 60 }}>

                                            <TableCell>{ws.workspaceName}</TableCell>
                                            <TableCell>{ws.projectName}</TableCell>
                                            <TableCell>{ws.organizationName}</TableCell>
                                            <TableCell>{ws.state}</TableCell>
                                            <TableCell style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                {ws.state === 'RUNNING' && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => {
                                                            if (ws.workspaceUrl) {
                                                                window.open(ws.workspaceUrl, '_blank', 'noopener,noreferrer');
                                                            }
                                                        }}
                                                        disabled={!ws.workspaceUrl}
                                                    >
                                                        Open
                                                    </Button>
                                                )}
                                                {(ws.state === 'RUNNING' || ws.state === 'DEPLOYING') && (

                                                    <Button
                                                        variant="outlined"
                                                        color="secondary"
                                                        onClick={async () => {
                                                            await changeWorkspaceState(ws, "PAUSED")
                                                        }}
                                                    >
                                                        Pause
                                                    </Button>
                                                )}

                                                {ws.state === 'PAUSED' && (
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={async () => {
                                                            await changeWorkspaceState(ws, "RUNNING")
                                                        }}
                                                    >
                                                        Run
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {rows.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} style={{ opacity: 0.7 }}>
                                                No workspaces found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <div style={{ marginTop: 12 }}>
                            <Button variant="outlined" onClick={load}>Refresh</Button>
                        </div>
                    </>
                )
                }
            </InfoCard >
        </div>
    );
};