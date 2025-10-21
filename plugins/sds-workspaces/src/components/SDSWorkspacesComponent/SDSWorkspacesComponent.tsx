import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { WorkspaceList } from '../WorkspaceList';
import { SdsWorkspaceProvider } from '../../context/SDSWorkspaceContext';
import { ConfigurationComponent } from '../ConfigurationComponent';

export const SDSWorkspacesComponent = () => {
  return (
    <Page themeId="tool">
      <Header title="SDS Workspaces Plugin" />
      <Content>
        <ContentHeader title="SDS Workspaces">
          <SupportButton>A description of your plugin goes here.</SupportButton>
        </ContentHeader>
        <SdsWorkspaceProvider>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}><ConfigurationComponent /></Grid>
            <Grid item xs={12} md={12}><WorkspaceList /></Grid>
          </Grid>
        </SdsWorkspaceProvider>
      </Content>
    </Page>
  );
}
