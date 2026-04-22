# ~@/forms

Schema-driven, headless form engine with Zod validation and 2-level component overrides.

## Quick Start

```tsx
import { Form } from "~@/forms";
import { z } from "zod";

const schema = {
  name: {
    type: "text" as const,
    label: "Full Name",
    validator: z.string().min(2, "At least 2 characters"),
  },
  email: {
    type: "text" as const,
    label: "Email",
    inputType: "email" as const,
    validator: z.string().email("Invalid email"),
  },
};

function MyForm() {
  return (
    <Form
      formId="my-form"
      schema={schema}
      onSubmit={(values) => {
        // values is typed: { name: string; email: string }
        console.log(values);
      }}
    />
  );
}
```

## Architecture

```
packages/forms/     → Core (headless, no UI, plain HTML defaults)
packages/ui/forms/  → Styled components (Tailwind)
```

The core package provides:
- Schema types and validation
- Form/FormField components with dynamic field resolution
- Multi-step form support
- Imperative control via `useFormRef`
- Conditional field visibility

The UI package provides Tailwind-styled field and layout components, registered globally via `AppFormProvider`.

## Features

### Basic Form

```tsx
<Form formId="basic" schema={schema} onSubmit={handleSubmit} />
```

### MultiStepForm (Wizard)

When **all** top-level fields are `type: "group"`, the form auto-switches to wizard mode:

```tsx
const schema = {
  step1: {
    type: "group" as const,
    header: "Personal Info",
    fields: {
      firstName: { type: "text" as const, label: "First Name", validator: z.string().min(1) },
      lastName: { type: "text" as const, label: "Last Name", validator: z.string().min(1) },
    },
  },
  step2: {
    type: "group" as const,
    header: "Account",
    fields: {
      email: { type: "text" as const, label: "Email", validator: z.string().email() },
    },
  },
};

<Form formId="wizard" schema={schema} onSubmit={handleSubmit} submitLabel="Create Account" />
```

### useFormRef (Imperative Control)

```tsx
const { formRef, submitForm, resetForm, clearForm, getFormValues, setFormValues } = useFormRef();

<Form ref={formRef} formId="form" schema={schema} onSubmit={handleSubmit} hideSubmitButton />

<button onClick={submitForm}>Submit</button>
<button onClick={() => resetForm()}>Reset</button>
```

### Conditional Visibility

Fields can be conditionally shown based on other field values:

```tsx
const schema = {
  hasAddress: { type: "checkbox" as const, label: "Add address?" },
  street: {
    type: "text" as const,
    label: "Street",
    shownIf: { fieldName: "hasAddress", operator: "equals", value: true },
  },
};
```

Operators: `equals`, `notEquals`, `in`, `notIn`, `greaterThan`, `lessThan`

### Custom Fields

```tsx
const schema = {
  color: {
    type: "custom" as const,
    render: ({ value, onChange }) => (
      <input type="color" value={value as string} onChange={(e) => onChange(e.target.value)} />
    ),
  },
};
```

### i18n Support

Use a function for the schema so `t` macro re-evaluates on locale change:

```tsx
const getSchema = () => ({
  name: { type: "text" as const, label: t`Name`, validator: z.string().min(1, t`Required`) },
});

<Form formId="form" schema={getSchema} onSubmit={handleSubmit} />
```

## Component Override System

### Override Levels

1. **Global**: `AppFormProvider` registers defaults for all forms
2. **Instance**: `<Form components={{ ... }}>` overrides for a specific form

### Override Keys

| Key | Props | Description |
|-----|-------|-------------|
| `text` | `FieldProps` | Text input |
| `textarea` | `FieldProps` | Textarea |
| `select` | `FieldProps` | Select dropdown |
| `checkbox` | `FieldProps` | Single checkbox |
| `checkboxGroup` | `FieldProps` | Checkbox group |
| `radioGroup` | `FieldProps` | Radio group |
| `toggle` | `FieldProps` | Toggle switch |
| `FormLayout` | `FormLayoutProps` | Form field wrapper |
| `GroupLayout` | `GroupLayoutProps` | Group wrapper |
| `SubmitButton` | `SubmitButtonProps` | Submit button |
| `StepIndicator` | `StepIndicatorProps` | Step progress |
| `StepNavigation` | `StepNavigationProps` | Step nav buttons |
| `StepContent` | `StepContentProps` | Step content |

### Custom Layout Example

```tsx
function TwoColLayout({ children, isReadOnly }: FormLayoutProps) {
  return (
    <fieldset disabled={isReadOnly} className="grid grid-cols-2 gap-4">
      {children}
    </fieldset>
  );
}

<Form formId="form" schema={schema} onSubmit={handleSubmit} components={{ FormLayout: TwoColLayout }} />
```

## Type System

### FieldTypeConfig

Central registry of field types and their config. Add new field types here:

```typescript
interface FieldTypeConfig {
  text: { inputType?: "text" | "email" | "password" | "url" | "number"; ... };
  textarea: { rows?: number; maxLength?: number };
  select: { options: SelectOption[] };
  checkbox: {};
  checkboxGroup: { options: SelectOption[] };
  radioGroup: { options: SelectOption[] };
  toggle: { onLabel?: string; offLabel?: string };
}
```

### InferFormValues

Derives TypeScript types from schema:

```typescript
const schema = {
  name: { type: "text" as const, validator: z.string() },
  role: { type: "select" as const, options: [...] },
} satisfies FormSchema;

type Values = InferFormValues<typeof schema>;
// { name: string; role: string }
```

## Adding a New Field Type

1. Add type config to `FieldTypeConfig` in `packages/forms/types.ts`
2. Add named alias: `export type MyFieldSchema = FieldSchemaFor<"myField">`
3. Add value type to `FieldTypeMap`
4. Create styled component in `packages/ui/forms/fields/`
5. Register in `AppFormProvider`

## Form Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `formId` | `string` | — | Unique form identifier |
| `schema` | `FormSchema \| () => FormSchema` | — | Field definitions |
| `onSubmit` | `(values) => void` | — | Submit handler |
| `defaultValues` | `Partial<Values>` | — | Initial values |
| `mode` | `"onBlur" \| "onChange" \| "onSubmit"` | `"onChange"` | Validation mode |
| `isReadOnly` | `boolean` | `false` | Disable all fields |
| `isSubmitting` | `boolean` | `false` | Show loading state |
| `submitLabel` | `string` | `"Submit"` | Button text |
| `hideSubmitButton` | `boolean` | `false` | Hide default button |
| `components` | `FormComponentOverrides` | — | Instance overrides |
| `ref` | `Ref<FormRefHandle>` | — | Imperative handle |
| `children` | `ReactNode` | — | Extra content |

## Field Status

| Field Type | Status |
|-----------|--------|
| text | ✅ Implemented |
| textarea | ✅ Implemented |
| select | ✅ Implemented |
| checkbox | 🔲 Type defined, needs UI |
| checkboxGroup | 🔲 Type defined, needs UI |
| radioGroup | 🔲 Type defined, needs UI |
| toggle | 🔲 Type defined, needs UI |
| custom | ✅ Implemented (in core) |

## File Structure

```
packages/forms/
├── types.ts                    # Type system
├── Form.tsx                    # Main component
├── FormField.tsx               # Dynamic field resolver
├── MultiStepForm.tsx           # Multi-step component
├── FormConfigProvider.tsx      # Context provider
├── buildZodSchema.ts           # Zod schema builder
├── evaluateCondition.ts        # Condition evaluator
├── filterHiddenFields.ts       # Hidden field filter
├── useCheckFieldVisibility.ts  # Per-field visibility
├── useHiddenFields.ts          # Form-level hidden tracking
├── useFormRef.ts               # Imperative control
├── useMultiStepForm.ts         # Step navigation
├── index.ts                    # Public exports
└── README.md

packages/ui/forms/
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
```
