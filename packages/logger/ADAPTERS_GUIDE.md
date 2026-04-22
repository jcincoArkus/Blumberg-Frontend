# Logger Adapters Guide

This guide explains how to implement custom logger adapters for the logger system.

## Overview

The logger uses an adapter pattern to support multiple logging destinations (console, DataDog, custom APIs, etc.). Each adapter implements the `LogAdapter` interface and handles the actual output of log entries.

## LogAdapter Interface

All adapters must implement this interface:

```typescript
import type { LogEntry } from "../types/log-entry.type";

export interface LogAdapter {
  /** Unique name for the adapter */
  readonly name: string;

  /** Whether the adapter is currently enabled */
  readonly isEnabled: boolean;

  /**
   * Initialize the adapter
   * Called once when the logger is initialized
   */
  initialize(): void;

  /**
   * Process a log entry
   * @param entry - The complete log entry to process
   */
  log(entry: LogEntry): void;

  /**
   * Update global context data (optional)
   * Called when context is updated via logger.updateContext()
   * @param context - The updated context data
   */
  updateContext?(context: Record<string, unknown>): void;
}
```

## LogEntry Structure

The `LogEntry` object passed to `log()` contains:

```typescript
interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  errorObject?: Error;
  additionalInfo?: Record<string, unknown>;
  context: ContextData;
  timeSinceInit: number;
}
```

## Example: Console Adapter

Here's the complete implementation of the console adapter as a reference:

```typescript
import { config } from "~@/config";

import { LOGGER_LEVEL_MAP } from "../constants/logger-level-map";
import type { LogEntry } from "../types/log-entry.type";
import type { LogAdapter } from "./adapter.interface";

const STORAGE_KEY = "app_logger_console";

export class ConsoleAdapter implements LogAdapter {
  readonly name = "console";

  get isEnabled(): boolean {
    // Check localStorage override first
    const storageValue = localStorage.getItem(STORAGE_KEY);
    if (storageValue !== null) {
      return storageValue === "true";
    }

    // Fall back to config
    return config.logger?.console?.enabled ?? true;
  }

  initialize(): void {
    // No initialization needed for console adapter
  }

  log(entry: LogEntry): void {
    if (!this.isEnabled) {
      return;
    }

    const consoleMethod = LOGGER_LEVEL_MAP[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase();

    // Format: [timestamp] [LEVEL] message
    const prefix = `[${timestamp}] [${level}]`;

    // Build log arguments
    const args: unknown[] = [prefix, entry.message];

    if (entry.errorObject) {
      args.push("\nError:", entry.errorObject);
    }

    if (entry.additionalInfo && Object.keys(entry.additionalInfo).length > 0) {
      args.push("\nAdditional Info:", entry.additionalInfo);
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      args.push("\nContext:", entry.context);
    }

    args.push(`\nTime since init: ${entry.timeSinceInit}ms`);

    // eslint-disable-next-line no-console
    console[consoleMethod](...args);
  }
}

export const consoleAdapter = new ConsoleAdapter();
```

## Example: DataDog Adapter

Here's how you would implement a DataDog adapter:

```typescript
import { datadogLogs } from '@datadog/browser-logs';
import { config } from "~@/config";

import type { LogEntry } from "../types/log-entry.type";
import type { LogAdapter } from "./adapter.interface";

const STORAGE_KEY = "app_logger_datadog";

export class DataDogAdapter implements LogAdapter {
  readonly name = "datadog";
  private _initialized = false;

  get isEnabled(): boolean {
    // 1. localStorage ALWAYS has priority (for debugging)
    // Developers can disable DataDog logging via browser console
    const storageValue = localStorage.getItem(STORAGE_KEY);
    if (storageValue !== null) {
      return storageValue === "true";
    }

    // 2. Default: enabled if DataDog is configured
    // If clientToken and applicationId are present, DataDog is enabled by default
    return !!(
      config.logger?.datadog?.clientToken &&
      config.logger?.datadog?.applicationId
    );
  }

  initialize(): void {
    if (this._initialized || !this.isEnabled) {
      return;
    }

    const ddConfig = config.logger?.datadog;
    if (!ddConfig?.clientToken || !ddConfig?.applicationId) {
      console.error("DataDog adapter: Missing required configuration");
      return;
    }

    try {
      datadogLogs.init({
        clientToken: ddConfig.clientToken,
        site: ddConfig.site ?? "datadoghq.com",
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
      });

      this._initialized = true;
    } catch (error) {
      console.error("Failed to initialize DataDog adapter:", error);
    }
  }

  log(entry: LogEntry): void {
    if (!this.isEnabled || !this._initialized) {
      return;
    }

    try {
      const logData = {
        message: entry.message,
        context: entry.context,
        timeSinceInit: entry.timeSinceInit,
        ...(entry.additionalInfo ?? {}),
      };

      // Map our levels to DataDog levels
      switch (entry.level) {
        case "info":
          datadogLogs.logger.info(entry.message, logData, entry.errorObject);
          break;
        case "warn":
          datadogLogs.logger.warn(entry.message, logData, entry.errorObject);
          break;
        case "error":
          datadogLogs.logger.error(entry.message, logData, entry.errorObject);
          break;
        case "critical":
          datadogLogs.logger.error(entry.message, {
            ...logData,
            critical: true,
          }, entry.errorObject);
          break;
      }
    } catch (error) {
      console.error("DataDog adapter failed to log:", error);
    }
  }

  updateContext(context: Record<string, unknown>): void {
    if (!this.isEnabled || !this._initialized) {
      return;
    }

    try {
      datadogLogs.setGlobalContext(context);
    } catch (error) {
      console.error("DataDog adapter failed to update context:", error);
    }
  }
}

export const datadogAdapter = new DataDogAdapter();
```

## Steps to Add a New Adapter

### 1. Install Dependencies

First, install any required packages:

```bash
pnpm add @datadog/browser-logs
```

### 2. Create Adapter File

Create your adapter file in `packages/logger/adapters/`:

```
packages/logger/adapters/
├── adapter.interface.ts
├── console-adapter.ts
└── datadog-adapter.ts    # New adapter
```

### 3. Implement LogAdapter Interface

Your adapter must implement:
- `name`: Unique string identifier
- `isEnabled`: Computed property that checks config and localStorage
- `initialize()`: Set up the third-party SDK
- `log()`: Process and forward log entries
- `updateContext()` (optional): Handle context updates

### 4. Add Configuration to Config Types

Update `packages/config/types.ts`:

```typescript
export interface AppConfig {
  // ... existing fields
  logger?: {
    console?: {
      enabled?: boolean;
    };
    datadog?: {
      // Your adapter-specific config
      clientToken?: string;
      applicationId?: string;
      site?: string;
    };
  };
}
```

### 5. Add Configuration to Config

Update `packages/config/config.ts`:

```typescript
export default {
  // ... existing config
  logger: {
    console: {
      enabled: import.meta.env.VITE_LOGGER_CONSOLE_ENABLED !== "false",
    },
    datadog: {
      clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
      applicationId: import.meta.env.VITE_DATADOG_APP_ID,
      site: import.meta.env.VITE_DATADOG_SITE ?? "datadoghq.com",
    },
  },
} as AppConfig;
```

### 6. Register Adapter in Logger

Update `packages/logger/logger.ts` in the `_initialize()` method:

```typescript
private _initialize(): void {
  // ... existing code

  // Console adapter is always available
  this._adapters = [consoleAdapter];

  // Add DataDog adapter if configured
  if (config.logger?.datadog?.clientToken) {
    this._adapters.push(datadogAdapter);
  }

  // ... rest of initialization
}
```

### 7. Add Environment Variables

Update the `.env` files in `packages/config/configs/`:

```env
# .env.production
VITE_LOGGER_CONSOLE_ENABLED="false"
VITE_DATADOG_CLIENT_TOKEN="your-client-token"
VITE_DATADOG_APP_ID="your-app-id"
VITE_DATADOG_SITE="datadoghq.com"
```

### 8. Export Adapter (Optional)

If you want to allow external usage of your adapter:

```typescript
// packages/logger/index.ts
export { datadogAdapter } from "./adapters/datadog-adapter";
```

## Best Practices

### 1. Error Handling

Always wrap adapter operations in try-catch blocks:

```typescript
log(entry: LogEntry): void {
  if (!this.isEnabled || !this._initialized) {
    return;
  }

  try {
    // Your logging logic here
  } catch (error) {
    console.error(`${this.name} adapter failed to log:`, error);
  }
}
```

### 2. Defensive Initialization

Don't let initialization failures crash the app:

```typescript
initialize(): void {
  if (this._initialized || !this.isEnabled) {
    return;
  }

  try {
    // Your initialization logic here
    this._initialized = true;
  } catch (error) {
    console.error(`Failed to initialize ${this.name} adapter:`, error);
  }
}
```

### 3. Configuration Validation

Check for required configuration before initializing:

```typescript
initialize(): void {
  const config = config.logger?.yourAdapter;
  if (!config?.apiKey) {
    console.error(`${this.name} adapter: Missing required configuration`);
    return;
  }
  // ... proceed with initialization
}
```

### 4. localStorage Override

Support runtime enable/disable via localStorage:

```typescript
const STORAGE_KEY = "blumberg_logger_your_adapter";

get isEnabled(): boolean {
  // Check localStorage override first
  const storageValue = localStorage.getItem(STORAGE_KEY);
  if (storageValue !== null) {
    return storageValue === "true";
  }

  // Fall back to config
  return !!config.logger?.yourAdapter?.apiKey;
}
```

### 5. Lazy Initialization

Only initialize when actually needed:

```typescript
private _ensureInitialized(): boolean {
  if (!this._initialized && this.isEnabled) {
    this.initialize();
  }
  return this._initialized;
}

log(entry: LogEntry): void {
  if (!this._ensureInitialized()) {
    return;
  }
  // ... logging logic
}
```

### 6. Context Management

Implement `updateContext()` if your adapter supports global context:

```typescript
updateContext(context: Record<string, unknown>): void {
  if (!this.isEnabled || !this._initialized) {
    return;
  }

  try {
    // Update your adapter's global context
    yourSDK.setGlobalContext(context);
  } catch (error) {
    console.error(`${this.name} adapter failed to update context:`, error);
  }
}
```

## Testing Your Adapter

### Manual Testing

```javascript
// In browser console

// 1. Enable your adapter
localStorage.setItem('blumberg_logger_your_adapter', 'true');
location.reload();

// 2. Test basic logging
logger.info('Test message');
logger.error({ message: 'Test error', errorObject: new Error('Test') });

// 3. Test context
logger.updateContext({ userId: 'test-123' });
logger.info('Message with context');

// 4. Verify in your adapter's dashboard
// Check that logs appear in DataDog
```

### Integration Testing

1. Test in development environment first
2. Verify logs appear in your third-party service
3. Test localStorage override functionality
4. Test error cases (missing config, network failures)
5. Test context tracking (userId, sessionId)

## Common Patterns

### Batching Logs

If your adapter needs to batch logs:

```typescript
export class BatchedAdapter implements LogAdapter {
  private _buffer: LogEntry[] = [];
  private _flushInterval: number | null = null;

  initialize(): void {
    this._flushInterval = window.setInterval(() => {
      this._flush();
    }, 5000); // Flush every 5 seconds
  }

  log(entry: LogEntry): void {
    this._buffer.push(entry);

    if (this._buffer.length >= 100) {
      this._flush(); // Flush when buffer is full
    }
  }

  private _flush(): void {
    if (this._buffer.length === 0) return;

    try {
      // Send buffered logs to your service
      yourSDK.sendBatch(this._buffer);
      this._buffer = [];
    } catch (error) {
      console.error('Failed to flush logs:', error);
    }
  }
}
```

### Sampling

If you need to sample logs in production:

```typescript
export class SampledAdapter implements LogAdapter {
  private _sampleRate = 0.1; // 10% of logs

  log(entry: LogEntry): void {
    if (Math.random() > this._sampleRate) {
      return; // Skip this log
    }

    // Process log normally
    yourSDK.log(entry);
  }
}
```

### Multiple Adapters

You can configure multiple adapters to run simultaneously by modifying the logger initialization:

```typescript
// In logger.ts
private _initialize(): void {
  // ... existing code

  // Use multiple adapters
  this._adapters = [consoleAdapter, datadogAdapter];

  // ... rest of initialization
}
```

## Troubleshooting

### Adapter Not Initializing

1. Check configuration is present in `config.logger.yourAdapter`
2. Check environment variables are set correctly
3. Check browser console for initialization errors
4. Verify `isEnabled` returns `true`

### Logs Not Appearing

1. Check `isEnabled` returns `true`
2. Check adapter initialized successfully
3. Check third-party service dashboard
4. Check network tab for failed requests
5. Verify API keys and credentials

### Performance Issues

1. Implement batching for high-frequency logging
2. Use sampling in production
3. Add rate limiting
4. Avoid synchronous network calls in `log()`

## Resources

- [DataDog Browser SDK Docs](https://docs.datadoghq.com/logs/log_collection/javascript/)
- [Logger Implementation](./logger.ts)
- [Console Adapter Reference](./adapters/console-adapter.ts)
