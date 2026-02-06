# Complete Example: Creating a New Panel

### Step 1: ViewModel

```typescript
// packages/view-model/{feature}/OrdersPanelViewModel.ts
import { makeAutoObservable } from "~@/mobx";

import { ordersViewModel } from "./OrdersViewModel";

class OrdersPanelViewModel {
  constructor() {
    makeAutoObservable(this);
  }

  get orders() {
    return ordersViewModel.orders;
  }

  get sortedOrders() {
    const priority = { urgent: 0, normal: 1, low: 2 } as const;
    return [...this.orders].sort((a, b) => {
      return (priority[a.priority] ?? 2) - (priority[b.priority] ?? 2);
    });
  }

  get urgentCount() {
    return this.orders.filter((o) => o.priority === "urgent").length;
  }

  get totalCount() {
    return this.orders.length;
  }

  get hasUrgent() {
    return this.urgentCount > 0;
  }

  getCustomerName(customerId: string): string {
    return ordersViewModel.getCustomerName(customerId);
  }
}

export const ordersPanelViewModel = new OrdersPanelViewModel();

export function useOrdersPanelViewModel() {
  return ordersPanelViewModel;
}
```

### Step 2: Types

```typescript
// packages/views/{feature}/OrdersPanel/types.ts
export interface Order {
  id: string;
  title: string;
  priority: "urgent" | "normal" | "low";
  customerId: string;
  createdAt: string;
}
```

### Step 3: Helpers

```typescript
// packages/views/{feature}/OrdersPanel/helpers.ts
export function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent": return "text-red-600";
    case "normal": return "text-amber-600";
    default: return "text-slate-600";
  }
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}
```

### Step 4: Sub-Components

```typescript
// packages/views/{feature}/OrdersPanel/OrderRow.tsx
import type { FC } from "react";

import { cn } from "~@/ui";

import { formatDate, getPriorityColor } from "./helpers";
import type { Order } from "./types";

interface OrderRowProps {
  order: Order;
  customerName: string;
}

export const OrderRow: FC<OrderRowProps> = ({ order, customerName }) => {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{order.title}</p>
        <p className="text-xs text-muted-foreground">{customerName}</p>
      </div>
      <div className="flex flex-col items-end">
        <span className={cn("text-xs font-medium", getPriorityColor(order.priority))}>
          {order.priority}
        </span>
        <span className="text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</span>
      </div>
    </div>
  );
};
```

```typescript
// packages/views/{feature}/OrdersPanel/PanelHeader.tsx
import type { FC } from "react";

import { t } from "~@/i18n/macro";
import { Badge, cn } from "~@/ui";

interface PanelHeaderProps {
  totalCount: number;
  hasUrgent: boolean;
}

export const PanelHeader: FC<PanelHeaderProps> = ({ totalCount, hasUrgent }) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold">{t`Orders`}</h3>
      <Badge
        variant="outline"
        className={cn(
          "text-xs",
          hasUrgent ? "border-red-300 text-red-700" : "border-emerald-300 text-emerald-700",
        )}
      >
        {totalCount}
      </Badge>
    </div>
  );
};
```

### Step 5: Root Component

```typescript
// packages/views/{feature}/OrdersPanel/index.tsx
import { observer } from "~@/mobx";
import { useOrdersPanelViewModel } from "~@/view-model";

import { OrderRow } from "./OrderRow";
import { PanelHeader } from "./PanelHeader";

export type { Order } from "./types";

export const OrdersPanel = observer(function OrdersPanel() {
  const vm = useOrdersPanelViewModel();

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
      <div className="px-3 pt-3 pb-0.5">
        <PanelHeader totalCount={vm.totalCount} hasUrgent={vm.hasUrgent} />
      </div>
      <div className="px-3 pb-3 space-y-1">
        {vm.sortedOrders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            customerName={vm.getCustomerName(order.customerId)}
          />
        ))}
      </div>
    </div>
  );
});
```

### Step 6: Barrel Exports

```typescript
// packages/views/{feature}/index.ts
export { OrdersPanel, type Order } from "./OrdersPanel";

// packages/view-model/{feature}/index.ts
export { useOrdersPanelViewModel, ordersPanelViewModel } from "./OrdersPanelViewModel";
```
