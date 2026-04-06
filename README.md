# FormCraft

> Type-safe, schema-driven form builder — React Hook Form + Zod + multi-step wizard with zero runtime type errors.

Built by [Aman Soni](https://github.com/amansoni1605) · [Portfolio](https://github.com/amansoni1605/portfolio)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 / Next.js 15 |
| Forms | React Hook Form v7 |
| Validation | Zod v3 |
| Resolver | @hookform/resolvers |
| Env | t3-env + Zod |
| Styling | Tailwind CSS v4 |

## Features

- **Schema-driven** — one Zod schema = TypeScript types + validation rules
- **Multi-step wizard** — per-step validation, back/forward navigation
- **Conditional fields** — show/hide fields based on other field values via `watch()`
- **Async validation** — debounced API checks (e.g. check if email exists)
- **JSON schema export** — generate CMS-driven forms from a JSON config
- **60% less boilerplate** than raw React Hook Form setup

## Usage

```tsx
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField, FormRoot } from 'form-craft'

const schema = z.object({
  name:  z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Invalid email'),
  type:  z.enum(['individual', 'business']),
  gst:   z.string().optional(),    // only shown when type === 'business'
})

type FormValues = z.infer<typeof schema>

export default function OnboardingForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })
  const type = form.watch('type')

  return (
    <FormRoot form={form} onSubmit={console.log}>
      <FormField name="name"  label="Full Name" />
      <FormField name="email" label="Email" type="email" />
      <FormField name="type"  label="Account Type" type="select"
        options={[{ value: 'individual', label: 'Individual' },
                  { value: 'business',   label: 'Business'   }]} />
      {type === 'business' && (
        <FormField name="gst" label="GST Number" />
      )}
    </FormRoot>
  )
}
```

## Multi-step Wizard

```tsx
import { FormWizard, FormStep } from 'form-craft'

const step1Schema = z.object({ name: z.string().min(2), email: z.string().email() })
const step2Schema = z.object({ plan: z.enum(['starter', 'pro', 'enterprise']) })
const step3Schema = z.object({ cardNumber: z.string().length(16) })

export default function SignupWizard() {
  return (
    <FormWizard onComplete={(data) => console.log('All steps:', data)}>
      <FormStep schema={step1Schema} title="Your Details">
        {/* Step 1 fields */}
      </FormStep>
      <FormStep schema={step2Schema} title="Choose Plan">
        {/* Step 2 fields */}
      </FormStep>
      <FormStep schema={step3Schema} title="Payment">
        {/* Step 3 fields */}
      </FormStep>
    </FormWizard>
  )
}
```

## License

MIT
