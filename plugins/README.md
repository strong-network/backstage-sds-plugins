# Adding SDS Workspaces Backend Plugin

Follow these steps to add the SDS Workspaces backend plugin to your Backstage backend.

---

## 1. Install the Plugin

From your Backstage backend root, run:

```bash
yarn add @citrixcloud/backstage-sds-workspaces-backend
```

---

## 2. Register the Plugin in Your Backend

Open your backend entry point, usually `packages/backend/src/index.ts`, and add the plugin:

```typescript
backend.add(import('@citrixcloud/backstage-sds-workspaces-backend'));
```

Place this line together with your other `backend.add(...)` statements.

---

That's it! The SDS Workspaces backend plugin is now enabled in your Backstage backend.
