---
name: date-management
description: |
  This skill should be used when working with dates, timestamps, or timezone-related code.
  It provides the strategy for handling dates consistently across PostgreSQL, Drizzle, contracts,
  and frontend to ensure timezone preservation and correct date-only handling.
  Do NOT load for general JavaScript Date API questions or date formatting without timezone concerns.
version: 1.0.0
---

# Date Management Strategy

This skill documents how dates flow through the system and how to handle them correctly to preserve timezone information.

## Data Flow

```
PostgreSQL (timestamptz)
    ↓ Drizzle returns Date object
Backend (Date object in memory)
    ↓ JSON.stringify() calls date.toISOString()
Wire/JSON ("2024-01-15T10:30:00.000Z")
    ↓
Frontend (receives string, parses to Date if needed)
```

## Key Principle: Timezone Preservation

`Date.toISOString()` always returns UTC with `Z` suffix, preserving the exact moment in time. No timezone information is lost—it's normalized to UTC.

## Date Types

| Type | Schema | TypeScript | Example | Use Case |
|------|--------|------------|---------|----------|
| Timestamps | `z.coerce.date()` | `Date` | `2024-01-15T10:30:00.000Z` | createdAt, updatedAt |
| Datetime | `z.coerce.date()` | `Date` | `2024-01-15T10:30:00.000Z` | scheduledAt, startsAt |
| Date-only | `z.string().date()` | `string` | `2024-01-15` | dateOfBirth, expiresOn |

## Schema Definitions

### Timestamps & Datetime: `z.coerce.date()`

```typescript
export const datetimeSchema = z.coerce.date()
```

- Accepts: Date objects (from backend), strings, numbers
- Returns: Date object
- JSON serialization: Automatic via `Date.toJSON()` → ISO string

### Date-only: `z.string().date()` (string)

```typescript
export const dateOnlySchema = z.string().date()
```

- Type is string: `"2024-01-15"`
- Avoids timezone ambiguity—a birthday is the same date everywhere
- Prevents issues like "birthday is yesterday in some timezones"

## Database Configuration

### PostgreSQL Column Types

```sql
-- Timestamps with timezone (REQUIRED for accurate time)
created_at TIMESTAMPTZ DEFAULT NOW()
scheduled_at TIMESTAMPTZ

-- Date-only fields (no time component)
date_of_birth DATE
```

### Drizzle Schema

```typescript
import { timestamp, date } from 'drizzle-orm/pg-core'

// Timestamps - MUST use { withTimezone: true, mode: 'date' }
createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
  .defaultNow()
  .notNull(),

// Date-only - use { mode: 'string' } to get ISO date string
dateOfBirth: date('date_of_birth', { mode: 'string' }),
```

## Frontend Handling

### Displaying Dates

Use date-fns with locale for user's local timezone:

```typescript
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

const date = new Date(user.createdAt)
format(date, 'PPP', { locale: enUS }) // "January 15, 2024"
```

### Form Inputs

For datetime inputs, convert to ISO string:

```typescript
const selectedDate = new Date(inputValue)
await createUser({ scheduledAt: selectedDate.toISOString() })
```

For date-only inputs, use the string directly:

```typescript
await createUser({ dateOfBirth: inputValue }) // string "2024-01-15"
```

## Common Mistakes

### 1. Missing timezone in Drizzle

```typescript
// BAD - loses timezone info
createdAt: timestamp('created_at', { mode: 'date' })

// GOOD - preserves timezone
createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
```

### 2. Manual date serialization in procedures

```typescript
// BAD - unnecessary, breaks type safety
return { ...user, createdAt: user.createdAt.toISOString() }

// GOOD - JSON.stringify handles it automatically
return user
```

### 3. Using Date for date-only fields

```typescript
// BAD - timezone can shift the date
dateOfBirth: z.coerce.date() // "2024-01-15" might become "2024-01-14"

// GOOD - string preserves the exact date
dateOfBirth: z.string().date() // Always "2024-01-15"
```

### 4. Displaying raw ISO strings

```typescript
// BAD - shows UTC time
<span>{user.createdAt}</span>

// GOOD - converts to local timezone
<span>{format(new Date(user.createdAt), 'PPp', { locale: enUS })}</span>
```

## Testing

Use fixed dates for deterministic tests:

```typescript
const fixedDate = new Date('2024-01-15T10:30:00.000Z')
vi.setSystemTime(fixedDate)
```

## Common Schemas

```typescript
// src/contracts/common/dates.ts
import { z } from 'zod'

// For timestamps (createdAt, updatedAt)
export const timestampsSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

// For datetime fields
export const datetimeSchema = z.coerce.date()

// For date-only fields
export const dateOnlySchema = z.string().date()
```

## Checklist

When working with dates:

- [ ] PostgreSQL uses `TIMESTAMPTZ` for datetime columns
- [ ] Drizzle uses `{ withTimezone: true, mode: 'date' }` for timestamps
- [ ] Drizzle uses `{ mode: 'string' }` for date-only columns
- [ ] Contracts use `datetimeSchema` (Date) or `dateOnlySchema` (string)
- [ ] Frontend displays dates using date-fns with locale
- [ ] No manual date serialization in procedures
