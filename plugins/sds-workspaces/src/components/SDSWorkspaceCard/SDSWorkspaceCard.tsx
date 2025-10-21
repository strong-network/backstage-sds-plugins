import { Grid } from '@material-ui/core';
import { WorkspaceList } from '../WorkspaceList';
import { SdsWorkspaceProvider, useSdsWorkspaceContext } from '../../context/SDSWorkspaceContext';
import { ConfigurationComponent } from '../ConfigurationComponent';
import { useEffect } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';


const InnerWorkspaceCard = () => {

    const { connected, fetchConfiguration } = useSdsWorkspaceContext();

    const { entity } = useEntity();
    const entityId = entity ? stringifyEntityRef(entity) : 'global';

    useEffect(() => {
        fetchConfiguration(entityId);

    }, [fetchConfiguration, entityId]);


    return (
        <Grid>
            {!connected && (
                <ConfigurationComponent innerCard />
            )}
            {connected && (
                <WorkspaceList innerCard />
            )}
        </Grid>
    );
};
export const SDSWorkspaceCard = () => {
    return (
        <div >
            <SdsWorkspaceProvider >
                <InnerWorkspaceCard />
            </SdsWorkspaceProvider>
        </div>
    );
}
