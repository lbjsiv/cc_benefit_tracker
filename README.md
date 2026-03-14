# MyCCPerks

Track and maximize your credit card perks. No bank linking required.

MyCCPerks helps you stay on top of credit card benefits that expire periodically — monthly credits, quarterly dining perks, annual hotel credits, free night certificates, and more. Never leave money on the table again.

## Features

- **Multi-card tracking** — Add any premium credit card and see all benefits in one place
- **Credits & free nights** — Track both dollar-value credits and free night certificates separately
- **Period-based tracking** — Benefits are organized by their reset frequency (monthly, quarterly, half-yearly, yearly)
- **Expiration dates** — Set expiration reminders on free night certificates
- **Annual fee overview** — See total annual fees across all cards and whether you're getting your money's worth
- **No bank linking** — Your financial accounts stay private; we only track what you tell us
- **PWA support** — Add to your iPhone/Android home screen for a native app experience

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Deployment:** Vercel
- **AI Pair Programmer:** Claude (Cursor)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the database schema in the Supabase SQL Editor:

```bash
# See scripts/schema.sql for the full schema
```

4. Seed the card catalog:

```bash
npm run seed
```

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Testing with a custom date

To test period boundaries, you can override the current date:

```bash
DATE=2026-12-28 npm run dev:date
```

## Project Structure

```
app/
  (protected)/          # Authenticated routes
    dashboard/          # Card overview + summary bar
    credit-benefits/    # Credit benefits tracker
    free-nights/        # Free night benefits tracker
    annual-fees/        # Annual fee breakdown
    cards/              # Card library + individual card detail
    settings/           # Account & notification preferences
  components/           # Shared UI components
  login/                # Landing page + auth
lib/
  benefits.ts           # Period calculation logic
  benefits-data.ts      # Server-side data fetching
  useBenefitActions.ts  # Client-side benefit actions (mark, undo, save)
  types.ts              # TypeScript interfaces
  supabase/             # Supabase client (browser + server)
scripts/
  schema.sql            # Database schema
  seed_credit_cards.ts  # Card + benefit seed data
```
