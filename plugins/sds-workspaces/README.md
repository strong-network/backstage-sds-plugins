# SDS Workspaces Plugin

A Backstage plugin to integrate [Citrix Secure Developer Spaces (SDS) Workspaces](https://docs.citrix.com/en-us/secure-developer-spaces) into your Backstage developer portal.

---

## Prerequisite: Backend Plugin Required

> **Important:**
>
> To use the SDS Workspaces frontend plugin, you **must** also install and configure the [`backstage-sds-workspaces-backend`](https://www.npmjs.com/package/@citrixcloud/backstage-sds-workspaces-backend) plugin in your Backstage backend project.
>
> This backend plugin enables all communication between Backstage and the SDS Workspaces platform.

---

## Features

- View and manage SDS Workspaces directly from Backstage.
- Custom SDS Workspace Cards and Tabs for your entities.
- Seamless integration with SDS Workspaces platform.

---

## Getting Started

### 1. Install the Plugin

```bash
# From your Backstage app root
yarn add @citrixcloud/backstage-sds-workspaces
```

---

### 2. Configure in `app-config.yaml`

Add the following section to your `app-config.yaml`:

```yaml
sdsWorkspaces:
  platformURL: ${platformURL}
```

Replace `${platformURL}` with your SDS Workspaces Platform base URL (e.g., `https://yourdomain.com`).

---

### 3. Add to Your Frontend

Import the plugin components in your app:

```typescript
export {
  SDSWorkspaceCard,
  SDSWorkspacesTab,
} from '@citrixcloud/backstage-sds-workspaces';
```

- **SDSWorkspaceCard**: Card component to display workspace info on entity pages.
- **SDSWorkspacesTab**: Tab component for additional workspace details.

---

## Example Usage

#### Add `SDSWorkspaceCard` to the Entity Overview Page

1. Open your `EntityPage.tsx` (commonly at `packages/app/src/components/catalog/EntityPage.tsx`).
2. Find the section for the Overview tab, often under:

```typescript
<EntityLayout.Route path="/" title="Overview">
  {/* ...other overview components... */}
  <Grid item md={6}>
    <SDSWorkspaceCard entity={entity} />
  </Grid>
  {/* ...other overview components... */}
</EntityLayout.Route>
```

This will display the SDS Workspace card on the entity’s Overview page.

---

#### Add `SDSWorkspacesTab` as a Tab in the Entity Page

1. In the same `EntityPage.tsx`, add a new route for the tab:

```typescript
<EntityLayout.Route path="/sds-workspaces" title="SDS Workspaces">
  <SDSWorkspacesTab entity={entity} />
</EntityLayout.Route>
```

This creates a new "SDS Workspaces" tab in the entity page navigation.

---

**Note:**  
If your entity page uses a different layout, insert these components where other entity cards or tabs are configured.
