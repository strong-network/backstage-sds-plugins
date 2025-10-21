# Backstage Plugins: Citrix SDS Workspaces

A small collection of plugins that integrate Citrix SDS Workspaces with Backstage.

Important: These plugins require access to a Citrix SDS Platform. Without an active Citrix SDS environment, the plugins cannot function.

Plugins

- @citrixcloud/backstage-sds-workspaces: Frontend plugin for browsing and interacting with Citrix SDS Workspaces in Backstage.
  - npm: https://www.npmjs.com/package/@citrixcloud/backstage-sds-workspaces
- @citrixcloud/backstage-sds-workspaces-backend: Backend plugin that provides APIs and integration with Citrix SDS platform.
  - npm: https://www.npmjs.com/package/@citrixcloud/backstage-sds-workspaces-backend

## Getting Started

To start the Backstage app:

```bash
yarn install
yarn dev
```

To run an individual plugin during development:

```bash
# Frontend
cd packages/backstage-sds-workspaces
yarn install
yarn start

# Backend
cd packages/backstage-sds-workspaces-backend
yarn install
yarn start
```

Note: The frontend plugin expects the backend route to be available (via your Backstage backend). Running the frontend alone may limit functionality.

## Support

- Open an issue for questions, bugs, or feature requests.
