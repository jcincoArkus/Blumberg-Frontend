# Domain Models

This package defines the **domain model** used by ViewModels and optionally by the API layer.

## Goal
- **Separate** backend DTOs (hey-api/OpenAPI) from business/UI models.
- Provide a consistent place for **entities, value objects, and mappers**.

## Recommended approaches

### 1) Use generated DTOs directly (fast path)
When the domain is simple, you can use types from `~@/api`:

```ts
import type { Sensor } from "~@/api";
```

### 2) Use custom models + mappers (recommended)
When you need adaptation, normalization, or business rules:

```ts
// models/sensor.ts
export interface SensorModel {
  id: string;
  name: string;
  status: string;
}

// models/mappers/sensor.ts
import type { Sensor } from "~@/api";
import type { SensorModel } from "./sensor";

export const toSensorModel = (dto: Sensor): SensorModel => ({
  id: dto.id,
  name: dto.displayName ?? dto.name,
  status: dto.status ?? "unknown",
});
```

## Suggested structure
```
packages/models/
  README.md
  index.ts
  mappers/
  types/
```

## When to create custom models
- UI-specific transformations
- Local defaults
- Business rules not present in the backend
- You want to decouple OpenAPI changes

