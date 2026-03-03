---
name: form-pattern
description: Pattern for implementing schema-driven forms with headless core, component overrides, Zod validation, and i18n support. Use when creating or modifying forms, adding new field types, or working with form validation.
---

# Form Pattern — Schema-Driven Forms

## Overview

Headless, schema-driven form engine with 2-level component overrides. The core package (`~@/forms`) provides logic, types, and unstyled defaults. The UI package provides Tailwind-styled components registered via a global provider.

## Key Principles

1. **Headless core**: `packages/forms/` has zero UI — plain HTML fallbacks only
2. **Dynamic resolution**: `components[fieldSchema.type]` — no switch/case in FormField
3. **Override flow**: Global provider → `FormConfigProvider` context → `<Form components={...}>` instance override
4. **Type safety**: `InferFormValues<T>` derives output types from schema definition
5. **Flat field namespace**: Group fields are for visual grouping only — field names are flat

## Template: Basic Form

```tsx
import { Form } from "~@/forms";
import { z } from "zod";

const schema = {
  name: {
    type: "text" as const,
    label: "Name",
    validator: z.string().min(2, "Name must be at least 2 characters"),
  },
  email: {
    type: "text" as const,
    label: "Email",
    inputType: "email" as const,
    validator: z.string().email("Invalid email"),
  },
  role: {
    type: "select" as const,
    label: "Role",
    options: [
      { label: "Admin", value: "admin" },
      { label: "User", value: "user" },
    ],
  },
};

function MyForm() {
  return (
    <Form
      formId="my-form"
      schema={schema}
      onSubmit={(values) => console.log(values)}
    />
  );
}
```

## Template: Type-Safe Form Values

Use `InferFormValues<T>` to derive the output type from a schema:

```tsx
import type { InferFormValues, FormSchema } from "~@/forms";

const schema = {
  name: { type: "text" as const, label: "Name" },
  email: { type: "text" as const, label: "Email", inputType: "email" as const },
} satisfies FormSchema;

type FormValues = InferFormValues<typeof schema>;
// { name: string; email: string }

function handleSubmit(values: FormValues) {
  console.log(values.name, values.email);
}
```

## Template: Form Schema with i18n

**Critical**: Schema must be a function (not static) so `t` macro re-evaluates on locale change.

```tsx
import { Form } from "~@/forms";
import type { FormSchema } from "~@/forms";
import { t } from "~@/i18n/macro";
import { z } from "zod";

const getFormSchema = (): FormSchema => ({
  name: {
    type: "text",
    label: t`Name`,
    placeholder: t`Enter your name`,
    validator: z.string().min(2, t`Name must be at least 2 characters`),
  },
  email: {
    type: "text",
    label: t`Email`,
    inputType: "email",
    validator: z.string().email(t`Invalid email address`),
  },
});

function MyForm() {
  return (
    <Form
      formId="my-form"
      schema={getFormSchema}
      onSubmit={(values) => console.log(values)}
    />
  );
}
```

## Template: MultiStepForm (Wizard)

When **all** top-level fields are `type: "group"`, the form auto-detects multi-step mode.

```tsx
import { Form } from "~@/forms";
import { z } from "zod";

const schema = {
  personalInfo: {
    type: "group" as const,
    header: "Personal Information",
    description: "Enter your basic details",
    fields: {
      firstName: {
        type: "text" as const,
        label: "First Name",
        validator: z.string().min(1, "Required"),
      },
      lastName: {
        type: "text" as const,
        label: "Last Name",
        validator: z.string().min(1, "Required"),
      },
    },
  },
  accountInfo: {
    type: "group" as const,
    header: "Account Information",
    fields: {
      email: {
        type: "text" as const,
        label: "Email",
        inputType: "email" as const,
        validator: z.string().email("Invalid email"),
      },
      password: {
        type: "text" as const,
        label: "Password",
        inputType: "password" as const,
        validator: z.string().min(8, "Min 8 characters"),
      },
    },
  },
};

function WizardForm() {
  return (
    <Form
      formId="wizard"
      schema={schema}
      onSubmit={(values) => console.log(values)}
      submitLabel="Create Account"
    />
  );
}
```

## Template: useFormRef (Imperative Control)

```tsx
import { Form, useFormRef } from "~@/forms";

function MyPage() {
  const { formRef, submitForm, resetForm, clearForm } = useFormRef();

  return (
    <div>
      <Form
        ref={formRef}
        formId="my-form"
        schema={schema}
        onSubmit={(values) => console.log(values)}
        hideSubmitButton
      />

      <button onClick={submitForm}>Submit from outside</button>
      <button onClick={() => resetForm()}>Reset</button>
      <button onClick={clearForm}>Clear</button>
    </div>
  );
}
```

## Template: External Fields

Fields rendered **outside** the `<form>` tag using `children` prop. They're still connected via `FormProvider`.

```tsx
import { Form, FormField } from "~@/forms";

function MyForm() {
  return (
    <Form
      formId="my-form"
      schema={schema}
      onSubmit={(values) => console.log(values)}
    >
      {/* These fields render outside the <form> tag but are connected */}
      <div className="sidebar">
        <FormField
          name="notes"
          field={{ type: "textarea", label: "Notes" }}
          components={{}}
          formId="my-form"
        />
      </div>
    </Form>
  );
}
```

## Template: Custom Fields

```tsx
import type { CustomFieldProps, FormSchema } from "~@/forms";

function ColorPicker({ value, onChange, error }: CustomFieldProps) {
  return (
    <div>
      <input
        type="color"
        value={(value as string) ?? "#000000"}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

const schema: FormSchema = {
  color: {
    type: "custom",
    label: "Pick a color",
    render: ColorPicker,
    validator: z.string().regex(/^#[0-9a-f]{6}$/i, "Invalid color"),
  },
};
```

## Template: Conditional Visibility

```tsx
const schema: FormSchema = {
  country: {
    type: "select",
    label: "Country",
    options: [
      { label: "US", value: "us" },
      { label: "Other", value: "other" },
    ],
  },
  state: {
    type: "text",
    label: "State",
    // Only shown when country === "us"
    shownIf: {
      fieldName: "country",
      operator: "equals",
      value: "us",
    },
  },
};
```

**Supported operators**: `equals`, `notEquals`, `in`, `notIn`, `greaterThan`, `lessThan`

## Template: Adding a New Field Type

5 steps to add a new field type (e.g., `datePicker`):

### Step 1: Add to `FieldTypeConfig` in `packages/forms/types.ts`
```typescript
export interface FieldTypeConfig {
  // ... existing types
  datePicker: {
    minDate?: string;
    maxDate?: string;
    format?: string;
  };
}
```

### Step 2: Add named alias
```typescript
export type DatePickerFieldSchema = FieldSchemaFor<"datePicker">;
```

### Step 3: Add to `FieldTypeMap`
```typescript
export interface FieldTypeMap {
  // ... existing types
  datePicker: string;
}
```

### Step 4: Create UI component in `packages/ui/forms/fields/`
```tsx
// packages/ui/forms/fields/DatePickerField.tsx
import { Controller, useFormContext } from "react-hook-form";
import type { DatePickerFieldSchema, FieldProps } from "~@/forms";

export function DatePickerField({ name, field, formId }: FieldProps) {
  const { control } = useFormContext();
  const f = field as DatePickerFieldSchema;
  // ... implementation
}
```

### Step 5: Register in `AppFormProvider`
```typescript
const components: FormComponentOverrides = {
  // ... existing
  datePicker: DatePickerField,
};
```

## Template: Layout Override

Override `FormLayout` for a 2-column grid layout:

```tsx
import { Form, type FormLayoutProps } from "~@/forms";

function TwoColumnLayout({ children, isReadOnly }: FormLayoutProps) {
  return (
    <fieldset disabled={isReadOnly} className="grid grid-cols-2 gap-4">
      {children}
    </fieldset>
  );
}

function MyForm() {
  return (
    <Form
      formId="my-form"
      schema={schema}
      onSubmit={handleSubmit}
      components={{ FormLayout: TwoColumnLayout }}
    />
  );
}
```

## Component Override Types

| Key | Props Interface | Description |
|-----|----------------|-------------|
| `text` | `FieldProps` | Text input (email, password, url, number) |
| `textarea` | `FieldProps` | Textarea |
| `select` | `FieldProps` | Native select |
| `checkbox` | `FieldProps` | Single checkbox |
| `checkboxGroup` | `FieldProps` | Multiple checkboxes |
| `radioGroup` | `FieldProps` | Radio button group |
| `toggle` | `FieldProps` | Toggle switch |
| `FormLayout` | `FormLayoutProps` | Wraps all form fields |
| `GroupLayout` | `GroupLayoutProps` | Wraps a group of fields |
| `SubmitButton` | `SubmitButtonProps` | Submit button |
| `StepIndicator` | `StepIndicatorProps` | Step progress indicator (multi-step) |
| `StepNavigation` | `StepNavigationProps` | Back/Next/Submit buttons (multi-step) |
| `StepContent` | `StepContentProps` | Step content wrapper (multi-step) |

## Best Practices

**DO:**
- Use `schema` as a function (`() => FormSchema`) when using `t` macro for i18n
- Use `validator` on each field for explicit validation
- Use `shownIf` for conditional visibility (not manual show/hide logic)
- Use `useFormRef` for imperative control from parent components
- Use the component override system for custom layouts — not props

**DON'T:**
- Don't put UI/styles in `packages/forms/` (core is headless)
- Don't use switch/case for field rendering (use the override map)
- Don't create static schemas when using i18n (schema function must re-evaluate)
- Don't mix group and non-group top-level fields (all-groups = wizard, mixed = regular)

## File Structure

```
packages/forms/           # Core — headless, no UI
├── types.ts              # Type system (single source of truth)
├── Form.tsx              # Main component
├── FormField.tsx         # Dynamic field resolver
├── MultiStepForm.tsx     # Multi-step form component
├── FormConfigProvider.tsx # Context provider
├── buildZodSchema.ts     # Zod schema builder
├── evaluateCondition.ts  # Condition evaluator
├── filterHiddenFields.ts # Hidden field filter
├── useCheckFieldVisibility.ts # Per-field visibility hook
├── useHiddenFields.ts    # Form-level hidden fields hook
├── useFormRef.ts         # Imperative control hook
├── useMultiStepForm.ts   # Multi-step navigation hook
└── index.ts              # Public exports

packages/ui/forms/        # UI — Tailwind styled
├── fields/
│   ├── TextField.tsx
│   ├── TextareaField.tsx
│   ├── SelectField.tsx
│   └── index.ts
├── layout/
│   ├── FormLayout.tsx
│   ├── GroupLayout.tsx
│   ├── SubmitButton.tsx
│   ├── StepIndicator.tsx
│   ├── StepNavigation.tsx
│   ├── StepContent.tsx
│   └── index.ts
└── index.ts

packages/ui/providers/
└── AppFormProvider.tsx    # Global component registration
```
