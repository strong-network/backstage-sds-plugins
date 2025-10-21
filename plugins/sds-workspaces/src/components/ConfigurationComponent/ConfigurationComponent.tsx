import { InfoCard, Progress } from '@backstage/core-components';
import { useSdsWorkspaceContext } from '../../context/SDSWorkspaceContext';
import { useEffect, useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';


type Props = {
  innerCard?: boolean;
};

export const ConfigurationComponent: React.FC<Props> = ({ innerCard }) => {
  const { loading, connected, configuration, isAdmin, quickTemplateLink, connect, refresh, logout, saveTemplateLink } = useSdsWorkspaceContext();
  const [templateLink, setTemplateLink] = useState('');

  const { entity } = useEntity();
  const entityId = entity ? stringifyEntityRef(entity) : 'global';


  useEffect(() => {
    refresh();
    setTemplateLink(quickTemplateLink);
  }, [refresh, quickTemplateLink]);

  const isTemplateLinkChanged = templateLink !== (configuration?.quickTemplateLink ?? '');



  return (<div style={{ width: '100%' }}>
    <InfoCard
      title="Workspace Plugin Configuration"
      subheader="Connect Backstage to your SDS Workspace account"
    >
      {loading && <Progress />}
      {!loading && (
        <div style={{ display: 'grid', gap: 12 }}>

          <div>
            Status:&nbsp;
            <strong>
              <strong>
                {connected === null && 'Unknown'}
                {connected === true && 'Connected'}
                {connected === false && 'Not connected'}
              </strong>
            </strong>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {!connected && (
              <Button
                color="primary"
                variant="contained"
                onClick={() => connect()}
              >
                Authenticate
              </Button>
            )}
            {(connected && !innerCard) && (
              <Button
                color="secondary"
                variant="outlined"
                onClick={logout}
              >
                Logout
              </Button>
            )}
          </div>

          {(connected && isAdmin) && (
            <>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>Workspace Template Quick Link</h3>
                <TextField
                  label="Quick Link"
                  variant="outlined"
                  size="small"
                  value={templateLink}
                  onChange={e => setTemplateLink(e.target.value)}
                  placeholder="https://external.platform/template"
                  fullWidth
                  style={{ marginTop: 8 }}
                />

                <Button style={{ marginTop: '0.5rem', marginRight: '0.5rem' }}
                  variant="outlined"
                  disabled={!isTemplateLinkChanged}
                  color="primary" onClick={() => saveTemplateLink(templateLink, entityId)}>
                  Save Link
                </Button>

                {configuration?.quickTemplateLink !== "" && (
                  <Button style={{ marginTop: '0.5rem' }}
                    variant="outlined"
                    onClick={() => { saveTemplateLink("", entityId); setTemplateLink(''); }}>
                    Remove Link
                  </Button>
                )}

              </div>
            </>
          )}

        </div>
      )
      }
    </InfoCard >
  </div >
  );
};