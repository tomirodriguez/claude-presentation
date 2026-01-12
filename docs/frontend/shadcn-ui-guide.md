# shadcn/ui Component System

## Introduction

This document describes the **shadcn/ui** component system, a modern approach to building UIs with copyable, customizable components.

---

## What is shadcn/ui?

**shadcn/ui is NOT a npm package**, it's a component system that:
1. Copies code directly to your project (full ownership)
2. You can modify it however you want (not locked to an API)
3. Uses unstyled primitives (Radix UI or Base UI)
4. Styled with Tailwind CSS

**Advantages**:
- ✅ No version dependency issues (the code is yours)
- ✅ 100% customizable
- ✅ Perfect tree-shaking (only import what you use)
- ✅ No "wrapper hell" (like MUI or Chakra)

---

## Setup

### 1. Initialize shadcn/ui

```bash
npx shadcn@latest init
```

### 2. Configuration (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## Adding Components

```bash
# Add a single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add button input card dialog form

# Browse all available components
npx shadcn@latest add
```

Components are copied to `src/components/ui/`.

---

## UI Stack

### Core
- **shadcn/ui** - Copyable component system
- **Radix UI** or **Base UI** - Unstyled primitives
- **Tailwind CSS** - Utility-first CSS
- **class-variance-authority** (cva) - Variant management
- **tailwind-merge** - Smart class merging

### Complementary Libraries
- **lucide-react** - Icons
- **sonner** - Toast notifications
- **cmdk** - Command palette (Cmd+K)
- **vaul** - Drawer component
- **react-day-picker** - Date picker
- **embla-carousel-react** - Carousel
- **recharts** - Charts

---

## Using Components

### Button

```tsx
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><IconComponent /></Button>

// With icon
<Button>
  <PlusIcon className="w-4 h-4 mr-2" />
  Add Item
</Button>

// Loading state
<Button disabled>
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  Loading...
</Button>
```

### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Form with React Hook Form

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
})

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>Your full name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description text goes here.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Dialog content */}
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Icons (lucide-react)

```tsx
import {
  Home,
  User,
  Settings,
  Search,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  Loader2,
} from "lucide-react"

// Usage
<Home className="w-5 h-5" />
<User className="w-4 h-4 text-muted-foreground" />

// In button
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Add New
</Button>

// Loading spinner
<Loader2 className="w-4 h-4 animate-spin" />
```

---

## Toast Notifications (sonner)

```tsx
import { toast } from "sonner"

// Success
toast.success("User created successfully")

// Error
toast.error("Failed to create user")

// With description
toast.success("User created", {
  description: "The user has been added to the team.",
})

// Promise toast
toast.promise(createUser(data), {
  loading: "Creating user...",
  success: "User created successfully",
  error: "Failed to create user",
})

// Custom action
toast("Event created", {
  action: {
    label: "Undo",
    onClick: () => undoCreate(),
  },
})
```

**Setup**: Add `<Toaster />` to your root layout:

```tsx
import { Toaster } from "@/components/ui/sonner"

function RootLayout({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
```

---

## Utility Function (cn)

The `cn` function merges Tailwind classes intelligently:

```tsx
import { cn } from "@/lib/utils"

// Basic usage
<div className={cn("px-4 py-2", className)} />

// Conditional classes
<div className={cn(
  "px-4 py-2 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />

// Overriding defaults
<Button className={cn("w-full", className)} />
```

**Implementation** (`src/lib/utils.ts`):

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## CSS Variables

shadcn/ui uses CSS variables for theming:

```css
/* src/app/index.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode colors */
  }
}
```

---

## Common Components for MVP

Essential components to add first:

```bash
npx shadcn@latest add button input label card dialog
npx shadcn@latest add dropdown-menu select form
npx shadcn@latest add table badge avatar skeleton tabs
npx shadcn@latest add toast alert separator
```

---

## Customizing Components

Since components are copied to your project, you can modify them freely:

```tsx
// src/components/ui/button.tsx
// Modify variants, add new sizes, change styles...

const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        // Add your custom variant
        brand: "bg-brand-500 text-white hover:bg-brand-600",
      },
      size: {
        // Add your custom size
        xs: "h-7 px-2 text-xs",
      },
    },
  }
)
```

---

## Best Practices

1. **Don't install shadcn via npm** - Use the CLI to copy components
2. **Customize freely** - The code is yours
3. **Use cn() for class merging** - Prevents class conflicts
4. **Keep components in ui/** - Maintain organization
5. **Use CSS variables for theming** - Easy dark mode support

---

## See Also

- `/data-table` skill - DataTable component patterns
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
