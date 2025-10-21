# Backstage SDS Workspaces Backend Plugin

A Backstage backend plugin that enables integration with **Citrix Secure Developer Spaces (SDS) Workspaces**.  
This backend plugin acts as the bridge between your Backstage instance and the SDS Workspaces platform, providing all required APIs for the frontend plugin .

---

## Features

- Provides backend APIs for SDS Workspaces integration.
- Handles authentication and communication with the SDS Workspaces platform.
- Enables the **SDS Workspaces Frontend Plugin** to display and manage workspaces inside Backstage.
- Securely connects your Backstage environment to SDS Workspaces without exposing platform credentials on the client side.

---

## Prerequisite

This backend plugin is required if you are using the [@citrixcloud/backstage-sds-workspaces](https://www.npmjs.com/package/@citrixcloud/backstage-sds-workspaces) frontend plugin.

---

## Installation

From your Backstage project root, install the backend plugin:

```bash
yarn --cwd packages/backend add @citrixcloud/backstage-sds-workspaces-backend
```

Then register it in your backend application (commonly \`packages/backend/src/index.ts\`):

```ts
const backend = createBackend();

// Add other plugins...
backend.add(import('@citrixcloud/backstage-sds-workspaces-backend'));
```

---

## Configuration

Add the following section to your \`app-config.yaml\` to configure the connection:

```yaml
sdsWorkspaces:
platformURL: ${platformURL}
```

Replace \`${platformURL}\` with the base URL of your **Citrix Secure Developer Spaces** platform (e.g., \`https://yourdomain.com\`).
