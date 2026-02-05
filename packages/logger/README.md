# Logger Package

Centralized logging system with multiple adapters and global context tracking.

## Quick Start

```typescript
import { logger } from '~@/logger';

// Basic logging
logger.info('Operation successful');
logger.warn('Potential issue detected');
logger.error('Operation failed');
logger.critical('System failure');

// With error object
logger.error({
  message: 'Failed to save data',
  errorObject: error as Error,
});

// With additional context
logger.info({
  message: 'User action completed',
  additionalInfo: { userId: '123', action: 'delete' },
});
```

## Features

- **Four Log Levels**: info, warn, error, critical
- **Context Management**: Track userId, sessionId across logs
- **Console Adapter**: Browser console output with intelligent defaults
- **Extensible**: Easy to add custom adapters (see ADAPTERS_GUIDE.md)
- **Environment-Aware**: Different configs for dev/staging/prod
- **Developer-Friendly**: localStorage overrides for debugging
- **Type-Safe**: Full TypeScript support
- **Auto-Initialize**: No setup required, works out of the box

## Usage

### Basic Logging

```typescript
// Simple string messages
logger.info('User logged in');
logger.warn('API latency high');
logger.error('Failed to load data');
logger.critical('Database connection lost');
```

### Advanced Logging

```typescript
// With error object
try {
  await riskyOperation();
} catch (error) {
  logger.error({
    message: 'Operation failed',
    errorObject: error as Error,
  });
}

// With additional information
logger.info({
  message: 'User deleted',
  additionalInfo: {
    userId: '123',
    deletedBy: 'admin',
    timestamp: Date.now(),
  },
});
```

### Context Management

```typescript
// On login - set user context
logger.updateContext({
  userId: user.email,
  sessionId: session.id,
});

// All subsequent logs will include this context
logger.info('Profile updated'); // Includes userId and sessionId

// On logout - clear context
logger.clearContext('User logged out');
```

### React Hook

```typescript
import { observer } from '~@/mobx';
import { useLogger } from '~@/logger';

export const MyComponent = observer(() => {
  const logger = useLogger();

  const handleClick = () => {
    logger.info('Button clicked');
  };

  return <button onClick={handleClick}>Click me</button>;
});
```

## Configuration

### Environment Variables

```env
# .env (local/development) - Enabled by default
VITE_LOGGER_CONSOLE_ENABLED="true"

# .env (staging/production) - Disabled by default
VITE_LOGGER_CONSOLE_ENABLED="false"
```

**Note:** When not set, console logging is enabled in `local`/`develop` environments and disabled in `staging`/`production` environments.

### Runtime Override

```javascript
// In browser console

// Force enable console logging
localStorage.setItem('app_logger_console', 'true');

// Force disable console logging
localStorage.setItem('app_logger_console', 'false');

// Use default from config
localStorage.removeItem('app_logger_console');

// Reload page to apply
location.reload();
```

## Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `info` | General information, successful operations | User logged in, data loaded |
| `warn` | Potential issues, degraded performance | API slow, deprecated feature |
| `error` | Recoverable errors, failed operations | Save failed, validation error |
| `critical` | Severe errors, system failures | DB down, auth failure |

## Best Practices

### ✅ Do

```typescript
// Include error objects
logger.error({
  message: 'Failed to save',
  errorObject: error as Error,
});

// Add context for debugging
logger.error({
  message: 'Operation failed',
  errorObject: error,
  additionalInfo: { userId, attemptNumber },
});

// Use appropriate levels
logger.critical({ message: 'System crash', errorObject: error });
logger.info('User action completed');
```

### ❌ Don't

```typescript
// Don't log sensitive data
logger.info({ message: 'Login', additionalInfo: { password } }); // Never!
logger.info({ message: 'Auth', additionalInfo: { token } }); // Never!

// Don't use wrong levels
logger.critical('User clicked button'); // Not critical
logger.info({ message: 'System crashed', errorObject: error }); // Should be critical

// Don't lose error details
catch (error) {
  logger.error('Failed'); // Missing error object
}
```

## Adapters

### Console Adapter

The console adapter outputs logs to the browser console.

**Features:**
- Enabled by default in `local`/`develop` environments
- Disabled by default in `staging`/`production` environments
- Can always be enabled via localStorage (even in production)
- Format: `[timestamp] [LEVEL] message`

**Example output:**
```
[2026-02-05T12:00:00.000Z] [INFO] User logged in
Error: Error object details
Additional Info: { userId: '123' }
Context: { sessionId: 'abc' }
Time since init: 1234ms
```

### Custom Adapters

The logger is extensible and supports custom adapters for:
- DataDog (production logging)
- Sentry (error tracking)
- Custom APIs or services
- File logging

See [ADAPTERS_GUIDE.md](./ADAPTERS_GUIDE.md) for implementation examples and instructions.

## API Reference

### Logger Methods

```typescript
// Singleton instance
export const logger: Logger;

// React hook
export const useLogger: () => Logger;

// Methods
logger.info(input: string | LogOptions): void;
logger.warn(input: string | LogOptions): void;
logger.error(input: string | LogOptions): void;
logger.critical(input: string | LogOptions): void;
logger.updateContext(context: Record<string, unknown>): void;
logger.clearContext(reason?: string): void;
```

### Types

```typescript
// Log levels
type LoggerLevel = 'info' | 'warn' | 'error' | 'critical';

// Log options
interface LogOptions {
  message: string;
  errorObject?: Error;
  additionalInfo?: Record<string, unknown>;
}

// Context data
interface ContextData {
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

// Log entry (passed to adapters)
interface LogEntry {
  level: LoggerLevel;
  message: string;
  timestamp: Date;
  errorObject?: Error;
  additionalInfo?: Record<string, unknown>;
  context: ContextData;
  timeSinceInit: number;
}
```

## Architecture

```
Logger (singleton)
  ├── LoggerContext (MobX observable)
  │   ├── context data (userId, sessionId, etc.)
  │   └── timeSinceInit (computed)
  └── Adapters (array)
      └── ConsoleAdapter (implemented)
```

### Initialization Flow

1. Logger instantiated as singleton
2. MobX `when()` waits for config to be ready
3. Console adapter is initialized
4. Logger ready to use

**Note:** Additional adapters can be added by following [ADAPTERS_GUIDE.md](./ADAPTERS_GUIDE.md).

### Logging Flow

1. User calls `logger.info('message')`
2. Logger creates LogEntry with timestamp, context, etc.
3. Logger passes entry to all enabled adapters
4. Each adapter formats and outputs the log
5. Errors in adapters are caught and logged (don't crash app)

## Testing

### Manual Test

```javascript
// In browser console after app loads

// Test basic logging
logger.info('Test');
logger.warn('Warning');
logger.error('Error');
logger.critical('Critical');

// Test with options
logger.error({
  message: 'Test error',
  errorObject: new Error('Test'),
  additionalInfo: { test: true }
});

// Test context
logger.updateContext({ userId: 'test' });
logger.info('With context');
logger.clearContext('Done testing');
logger.info('Without context');

// Test override
localStorage.setItem('app_logger_console', 'false');
location.reload();
logger.info('Should not appear');
```

## Troubleshooting

### Logs not appearing

1. Check environment: Are you in `local`/`develop`? (enabled by default)
2. Check config: `config.logger.console.enabled`
3. Check localStorage: `localStorage.getItem('app_logger_console')`
4. Try forcing enable: `localStorage.setItem('app_logger_console', 'true')` then reload

### Context not working

1. Verify MobX is initialized
2. Check context update: `logger.updateContext({ test: 'value' })`
3. Check next log includes context

### TypeScript errors

1. Ensure path alias is configured: `~@/logger`
2. Check imports are correct
3. Verify types are exported from `index.ts`

## Resources

- **Adapter Guide**: `ADAPTERS_GUIDE.md` - How to create custom adapters

## License

See project LICENSE file
