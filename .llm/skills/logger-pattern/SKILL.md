---
name: logger-pattern
description: Pattern for using the centralized logger system to replace console.log/warn/error throughout the application. Use when adding logging, replacing console methods, setting up error tracking, or managing log context.
---

# Logger Pattern with MobX

## Overview

Pattern for implementing centralized, configurable logging with console output and global context tracking. Uses the **Singleton + Hook Pattern** with **MobX** for reactive state management. Extensible architecture allows adding custom adapters (DataDog, Sentry, etc.) in the future.

## Key Principles

1. **Singleton Pattern**: One logger instance globally accessible
2. **Hook Pattern**: Access via `useLogger()` hook in React components
3. **Four Log Levels**: info, warn, error, critical
4. **Context Management**: Track global data (userId, sessionId) across all logs
5. **Console Adapter**: Browser console output with intelligent defaults
6. **Extensible**: Easy to add custom adapters (see ADAPTERS_GUIDE.md)
7. **Environment-Aware**: Different configurations per environment
8. **Type-Safe**: Full TypeScript support

## When to Use Logger

**Replace console methods:**
- `console.log()` → `logger.info()`
- `console.warn()` → `logger.warn()`
- `console.error()` → `logger.error()`
- Critical errors → `logger.critical()`

**Do NOT replace:**
- Console logs in build scripts
- Development-only debugging (temporary logs)

## Template: Basic Usage

```typescript
import { logger } from "~@/logger";

// Simple string messages
logger.info("Operation completed successfully");
logger.warn("Potential issue detected");
logger.error("Operation failed");
logger.critical("System failure");
```

## Template: With Options Object

```typescript
import { logger } from "~@/logger";

// With error object
logger.error({
  message: "Failed to attach auth token",
  errorObject: error as Error,
});

// With additional info
logger.info({
  message: "User action completed",
  additionalInfo: { userId: "123", action: "delete" },
});

// Complete example
logger.error({
  message: "Failed to process operation",
  errorObject: error as Error,
  additionalInfo: {
    itemId: "456",
    attemptNumber: 3,
    timestamp: Date.now(),
  },
});
```

## Template: Context Management

```typescript
import { logger } from "~@/logger";

// Set global context (e.g., on login)
logger.updateContext({
  userId: user.email,
  sessionId: session.id,
});

logger.info("User logged in successfully");
// All subsequent logs will include userId and sessionId

// Clear context (e.g., on logout)
logger.clearContext("User logged out");
// Clears all context data
```

## Template: Error Handling in Try-Catch

```typescript
import { logger } from "~@/logger";

// Before
try {
  await someAsyncOperation();
} catch (error) {
  console.error("Operation failed:", error); // ❌
}

// After
try {
  await someAsyncOperation();
} catch (error) {
  logger.error({
    message: "Operation failed",
    errorObject: error as Error,
  }); // ✅
}
```

## Template: Login/Logout Flow in ViewModel

```typescript
import { makeAutoObservable } from "~@/mobx";
import { logger } from "~@/logger";

class AuthViewModel {
  constructor() {
    makeAutoObservable(this);
  }

  login = async (email: string, password: string) => {
    try {
      const response = await this.loginMutation.mutateAsync({
        body: { email, password },
      });

      if (response?.token) {
        // Set context with user info
        logger.updateContext({
          userId: email,
          sessionId: response.token.substring(0, 8),
        });

        logger.info("User logged in successfully");
        return true;
      }
    } catch (error) {
      logger.error({
        message: "Login failed",
        errorObject: error as Error,
        additionalInfo: { email },
      });
      return false;
    }
  };

  logout = () => {
    logger.clearContext("User logged out");
    this.clearSession();
  };
}
```

## Template: API Interceptor Errors

```typescript
import { logger } from "~@/logger";

const authInterceptor = async (request: Request) => {
  try {
    const token = await getToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  } catch (error) {
    logger.error({
      message: "Failed to attach auth token",
      errorObject: error as Error,
    });
    return request;
  }
};
```

## Template: ViewModel with Logger

```typescript
import { makeAutoObservable } from "~@/mobx";
import { logger } from "~@/logger";
import { getItemsV1ObservedQuery } from "~@/api";

class ItemsViewModel {
  #itemsQuery = getItemsV1ObservedQuery();

  constructor() {
    makeAutoObservable(this);
    this.#itemsQuery.load();
  }

  loadData = async () => {
    try {
      const data = await this.#itemsQuery.loadAsync();
      logger.info("Data loaded successfully");
      return data;
    } catch (error) {
      logger.error({
        message: "Failed to load data",
        errorObject: error as Error,
        additionalInfo: { viewModel: this.constructor.name },
      });
      throw error;
    }
  };
}
```

## Template: React Component with Logger

```typescript
import { observer } from "~@/mobx";
import { useLogger } from "~@/logger";

export const MyComponent = observer(function MyComponent() {
  const logger = useLogger();

  const handleClick = () => {
    logger.info("Button clicked");
  };

  const handleError = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      logger.error({
        message: "Operation failed",
        errorObject: error as Error,
      });
    }
  };

  return <button onClick={handleClick}>Click me</button>;
});
```

## Log Levels Reference

| Level | When to Use | Example |
|-------|-------------|---------|
| `info` | Successful operations, user actions, general information | User logged in, data loaded |
| `warn` | Potential issues, degraded performance, deprecated features | API slow, retry attempt |
| `error` | Recoverable errors, failed operations | Save failed, validation error |
| `critical` | Severe errors, system failures, data loss | DB down, auth failure |

### Info Level

```typescript
// Successful operations
logger.info("User profile loaded");
logger.info("Cache updated");
logger.info("Navigation completed");
```

### Warn Level

```typescript
// Potential issues
logger.warn("API response time exceeded threshold");
logger.warn("Using deprecated method");
logger.warn("Retry attempt 3 of 5");
```

### Error Level

```typescript
// Recoverable errors
logger.error({ message: "Failed to load data", errorObject: error });
logger.error({ message: "Invalid form data", additionalInfo: { errors } });
logger.error({ message: "Network request failed", errorObject: error });
```

### Critical Level

```typescript
// Severe errors
logger.critical({ message: "Database connection lost", errorObject: error });
logger.critical({ message: "Authentication system failure", errorObject: error });
logger.critical({ message: "Data corruption detected", additionalInfo: { dataId } });
```

## Best Practices

✅ **DO:**
- Use appropriate log levels (info for success, error for failures)
- Include error objects in error/critical logs
- Add `additionalInfo` for debugging context
- Set context on login/session start
- Clear context on logout/session end
- Use `useLogger()` hook in React components
- Use TypeScript types for log options

```typescript
// ✅ Good - includes error object
catch (error) {
  logger.error({
    message: "Operation failed",
    errorObject: error as Error,
    additionalInfo: { userId, attemptNumber: 3 },
  });
}

// ✅ Good - set context once
logger.updateContext({ userId: user.id, sessionId: session.id });
logger.info("Profile updated"); // Context included automatically

// ✅ Good - clear context on logout
logout = () => {
  logger.clearContext("User logged out");
  this.clearSession();
};
```

❌ **DON'T:**
- Use wrong log levels (critical for non-critical events)
- Log sensitive data (passwords, tokens, PII)
- Lose error details (always include errorObject)
- Repeat context in every log (use updateContext instead)
- Forget to clear context on logout

```typescript
// ❌ Bad - wrong level
logger.critical("User clicked button"); // Not critical

// ❌ Bad - logs sensitive data
logger.info({ message: "Login", additionalInfo: { password } }); // Never!

// ❌ Bad - loses error details
catch (error) {
  logger.error("Failed"); // Missing error object
}

// ❌ Bad - repeats context
logger.info({
  message: "Action",
  additionalInfo: { userId, sessionId }, // Use updateContext instead
});
```

## Security: What NOT to Log

Never log sensitive data:
1. Passwords or credentials
2. Authentication tokens
3. API keys or secrets
4. Personal Identifiable Information (PII) - use IDs instead
5. Credit card numbers or payment info
6. Social Security Numbers
7. Health information

```typescript
// ❌ Never log sensitive data
logger.info({ message: "Login", additionalInfo: { password } }); // Never!
logger.info({ message: "Auth", additionalInfo: { token } }); // Never!

// ✅ Use IDs instead
logger.info({ message: "Login", additionalInfo: { userId: user.id } }); // Safe
```

## Configuration

### Environment Variables

```env
# Development (enabled by default)
VITE_LOGGER_CONSOLE_ENABLED="true"

# Production (disabled by default, can enable via localStorage)
VITE_LOGGER_CONSOLE_ENABLED="false"
```

### Runtime Override (localStorage)

```javascript
// In browser console - enable/disable console logging
localStorage.setItem("app_logger_console", "true"); // Force enable
localStorage.setItem("app_logger_console", "false"); // Force disable
localStorage.removeItem("app_logger_console"); // Use default
location.reload();
```

## API Reference

### Logger Methods

```typescript
// Singleton instance
export const logger: Logger;

// React hook
export const useLogger: () => Logger;

// Log methods
logger.info(input: string | LogOptions): void;
logger.warn(input: string | LogOptions): void;
logger.error(input: string | LogOptions): void;
logger.critical(input: string | LogOptions): void;

// Context methods
logger.updateContext(context: Record<string, unknown>): void;
logger.clearContext(reason?: string): void;
```

### Types

```typescript
// Log levels
type LoggerLevel = "info" | "warn" | "error" | "critical";

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
```

## Testing

```javascript
// In browser console

// Test basic logging
logger.info("Test info");
logger.warn("Test warning");
logger.error("Test error");
logger.critical("Test critical");

// Test with options
logger.error({
  message: "Test error",
  errorObject: new Error("Test"),
  additionalInfo: { test: true },
});

// Test context
logger.updateContext({ userId: "test-user" });
logger.info("With context"); // Should include userId
logger.clearContext("Done testing");
logger.info("Without context"); // Should NOT include userId

// Test localStorage override
localStorage.setItem("app_logger_console", "false");
location.reload();
logger.info("Should not appear");
```

## Adapters

### Current Implementation

- **Console Adapter** - Browser console output with intelligent defaults
  - Enabled by default in local/develop
  - Disabled by default in staging/production
  - Can always be enabled via localStorage for debugging

### Extensibility

The logger uses an adapter pattern and can be extended with custom adapters:
- DataDog for production logging
- Sentry for error tracking
- Custom APIs or file logging

See `packages/logger/ADAPTERS_GUIDE.md` for implementation examples.

## When to Use Local State vs Logger Context

**Logger Context (`updateContext`):**
- User identification (userId, email)
- Session tracking (sessionId, authToken hash)
- Environment info (version, build)
- Data that should persist across all logs

**Local State (`useState` / ViewModel):**
- Temporary UI state
- Form inputs
- Component-specific data
- Data that doesn't need to appear in every log
