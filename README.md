# Getting Started

This guide assumes you're working from the project root. VS Code is recommended (TypeScript/React tooling, Run and Debug).

## Prerequisites

- [Bun](https://bun.sh/) (v1.3.8+)
- Backend running (for login and API). See the backend project’s setup if needed.

## Setup Steps

1. **Install Bun** (if needed)

    ```bash
    curl -fsSL https://bun.sh/install | bash
    ```

2. **Install dependencies**

    ```bash
    bun install
    ```

3. **Start the dev server**

    ```bash
    bun app:start
    ```

    The app will be at **http://localhost:4080**.  
    Start this *before* running any backend/DB setup if the backend expects the frontend to be available.

4. **Log in**

    Use the credentials from your backend project setup. If you need help, ask in the Teams channel.

## Regenerating the API client

Before running `bun api:gen`, verify the `inputPath` in [`packages/api/openapi.config.ts`](packages/api/openapi.config.ts) points to your local backend repo. This path is machine-specific and is not committed with a guaranteed value. It should resolve to the `openapi.yaml` file inside the backend project, e.g.:

```ts
inputPath: "./../Blumberg-Backend/Adapters/OpenApi/openapi.yaml"
```

Adjust the directory name to match where you cloned the backend on your machine.
