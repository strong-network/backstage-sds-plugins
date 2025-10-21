import { Grid } from '@material-ui/core';
import { WorkspaceList } from '../WorkspaceList';
import { SdsWorkspaceProvider, useSdsWorkspaceContext } from '../../context/SDSWorkspaceContext';
import { ConfigurationComponent } from '../ConfigurationComponent';
import { useEffect } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';


const InnerWorkspaceCard = () => {
  const { connected, isAdmin, configuration, fetchConfiguration } = useSdsWorkspaceContext();

  const { entity } = useEntity();
  const entityId = entity ? stringifyEntityRef(entity) : 'global';

  useEffect(() => {
    fetchConfiguration(entityId);
  }, [fetchConfiguration, entityId]);


  return (
    <>
      {(!connected || isAdmin) && (
        <Grid style={{ marginBottom: "1.5rem" }} >
          <ConfigurationComponent innerCard />
        </Grid>
      )}
      {(connected && configuration?.projectId !== "") && (
        <Grid >
          <WorkspaceList innerCard />
        </Grid>
      )}
    </>
  );
};

export const SDSWorkspacesTab = () => {
  return (
    <div>
      <SdsWorkspaceProvider>
        <InnerWorkspaceCard />
      </SdsWorkspaceProvider>
    </div>
  );
}
