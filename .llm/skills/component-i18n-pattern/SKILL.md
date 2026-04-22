---
name: component-i18n-pattern
description: Pattern for implementing internationalization in React components using Lingui macros and the global i18n module
---

# Component i18n Pattern with Lingui

## Overview

Pattern for implementing **internationalization (i18n)** in React components using **Lingui** macros through the global `~@/i18n` module.

## Key Principles

1. **Global Module**: Always use `~@/i18n` instead of direct Lingui imports
2. **Macros**: Use `t`, `Trans`, `Plural`, `Select` macros for translations
3. **Runtime Evaluation**: Wrap schemas/configs with i18n in functions
4. **No String Concatenation**: Use template literals with variables
5. **Extract & Compile**: Messages are extracted to `.po` files and compiled to `.ts`

## Import Patterns

**✅ CORRECT - Use global module:**
```typescript
import { I18nProvider } from '~@/i18n';
import { t, Trans, Plural, Select, msg, useLingui } from '~@/i18n/macro';
import { Language } from '~@/i18n';
```

**❌ INCORRECT - Direct Lingui imports are banned:**
```typescript
// ❌ DON'T DO THIS
import { Trans } from '@lingui/react';
import { t } from '@lingui/core/macro';
```

## Template: Basic Component with Trans

```tsx
import { Trans } from "~@/i18n/macro";

export function WelcomeMessage() {
  return (
    <div>
      <h1><Trans>Welcome to the app</Trans></h1>
      <p><Trans>Please sign in to continue</Trans></p>
    </div>
  );
}
```

## Template: Trans with Variables

```tsx
import { Trans } from "~@/i18n/macro";

interface UserGreetingProps {
  userName: string;
  messageCount: number;
}

export function UserGreeting({ userName, messageCount }: UserGreetingProps) {
  return (
    <div>
      <Trans>Hello {userName}, you have {messageCount} messages</Trans>
    </div>
  );
}
```

## Template: Trans with Nested Components

```tsx
import { Trans } from "~@/i18n/macro";

export function ImportantNotice() {
  return (
    <div>
      <Trans>
        <strong>Note:</strong> Please enter your credentials
      </Trans>
    </div>
  );
}
```

## Template: String Translation with t Macro

```tsx
import { t } from "~@/i18n/macro";

export function SearchInput() {
  const placeholder = t`Search items...`;
  const ariaLabel = t`Search input field`;

  return (
    <input
      type="text"
      placeholder={placeholder}
      aria-label={ariaLabel}
    />
  );
}
```

## Template: t Macro with Variables

```tsx
import { t } from "~@/i18n/macro";

interface WelcomeProps {
  userName: string;
  unreadCount: number;
}

export function WelcomeBanner({ userName, unreadCount }: WelcomeProps) {
  const greeting = t`Hello ${userName}`;
  const notification = t`You have ${unreadCount} unread messages`;

  return (
    <div>
      <h2>{greeting}</h2>
      <p>{notification}</p>
    </div>
  );
}
```

## Template: Pluralization with Plural

```tsx
import { Plural } from "~@/i18n/macro";

interface MessageCountProps {
  count: number;
}

export function MessageCount({ count }: MessageCountProps) {
  return (
    <div>
      <Plural
        value={count}
        zero="No messages"
        one="# message"
        other="# messages"
      />
    </div>
  );
}
```

## Template: Conditional Selection with Select

```tsx
import { Select } from "~@/i18n/macro";

interface UserStatusProps {
  status: 'online' | 'offline' | 'away';
}

export function UserStatus({ status }: UserStatusProps) {
  return (
    <div>
      <Select
        value={status}
        online="User is online"
        offline="User is offline"
        away="User is away"
        other="Unknown status"
      />
    </div>
  );
}
```

## Template: useLingui Hook

```tsx
import { useLingui } from "~@/i18n/macro";
import { Language } from "~@/i18n";

export function LanguageSwitcher() {
  const { i18n } = useLingui();

  const changeLanguage = async (lang: Language) => {
    const { messages } = await import(`~@/i18n/locales/${lang}.ts`);
    i18n.load(lang, messages);
    i18n.activate(lang);
  };

  return (
    <div>
      <button onClick={() => changeLanguage(Language.EN)}>English</button>
      <button onClick={() => changeLanguage(Language.ES)}>Español</button>
    </div>
  );
}
```

**Note:** The `Language` enum is defined and exported from `~@/i18n` (e.g., `Language.EN`, `Language.ES`).

## Template: msg Macro (Define Messages)

```tsx
import { msg } from "~@/i18n/macro";

// Define messages for use elsewhere
export const messages = {
  welcome: msg`Welcome to the app`,
  error: msg`An error occurred`,
  success: msg`Operation successful`,
  loading: msg`Loading...`,
};
```

## Template: Validation Schema with i18n (CRITICAL PATTERN)

**⚠️ IMPORTANT: Always wrap schemas with i18n messages in functions!**

```tsx
import { t } from "~@/i18n/macro";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// ❌ WRONG - Messages are "frozen" at module load time
const formSchema = z.object({
  name: z.string().min(2, { message: t`Name must be at least 2 characters.` }),
  email: z.string().email({ message: t`Invalid email address.` }),
});

// ✅ CORRECT - Messages are evaluated each time the function is called
const getFormSchema = () =>
  z.object({
    name: z.string().min(2, { message: t`Name must be at least 2 characters.` }),
    email: z.string().email({ message: t`Invalid email address.` }),
  });

// Usage in component
export function MyForm() {
  const formSchema = getFormSchema(); // Called on each render
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  // ... rest of component
}
```

**Why?** Static objects at module level are evaluated once when the module loads. If the user changes language, the messages remain in the original language. Functions are evaluated each time they're called, respecting the current locale.

**This pattern applies to:**
- Validation schemas (Zod, Yup, Joi)
- Status/config objects with labels
- Menu items with translated text
- Any object defined outside a component that contains `t` macros

## Template: Date and Number Formatting

```tsx
import { useLingui } from "~@/i18n/macro";

export function FormattedData() {
  const { i18n } = useLingui();

  const formattedDate = i18n.date(new Date());
  const formattedNumber = i18n.number(1234.56);

  return (
    <div>
      <p>Date: {formattedDate}</p>
      <p>Number: {formattedNumber}</p>
    </div>
  );
}
```

## Best Practices

✅ **DO:**
- **Use global module** - Always import from `~@/i18n` and `~@/i18n/macro`
- **Use macros for all visible text** - Wrap all user-facing text in `Trans` or `t`
- **Use template literals** - `t\`Hello ${userName}\`` instead of concatenation
- **Wrap schemas in functions** - Use `getFormSchema()` pattern for validation schemas
- **Use descriptive IDs** - For complex messages: `<Trans id="login.welcome.message">...</Trans>`
- **Keep translations updated** - Regularly review `.po` files for untranslated messages

❌ **DON'T:**
- **Don't import Lingui directly** - Never use `@lingui/react` or `@lingui/core/macro`
- **Don't use hardcoded strings** - Always use `Trans` or `t` for user-facing text
- **Don't concatenate strings** - Use template literals with variables instead
- **Don't define schemas at module level** - Wrap in functions for runtime evaluation
- **Don't edit `.ts` files in locales/** - They are auto-generated from `.po` files

## Translation Workflow

1. **Write code** with translation macros (`t`, `Trans`, etc.)
2. **Extract messages** → Run `pnpm i18n:extract` to generate `.po` files
3. **Translate** → Edit `.po` files with translations
4. **Compile** → Run `pnpm i18n:compile` to generate optimized `.ts` files

## Available Scripts

```bash
# Extract messages from source code
pnpm i18n:extract

# Watch for changes and extract automatically
pnpm i18n:watch

# Compile translations to TypeScript
pnpm i18n:compile
```

## Important Notes

- **Don't edit** `.ts` files in `locales/` - they are auto-generated
- **Always translate** in `.po` files
- **Macros** are removed at build time for optimization
- **Extraction and compilation** are integrated into dev and build commands
- Untranslated messages will appear with `msgstr ""` in `.po` files

