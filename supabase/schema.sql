-- ============================================================================
-- Shagufta Manauwar — booking system schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- ============================================================================

-- Available appointment slots, created by the admin.
create table if not exists slots (
  id uuid primary key default gen_random_uuid(),
  starts_at    timestamptz not null,
  duration_min int         not null default 30,
  status       text        not null default 'available', -- available | held | booked | blocked
  created_at   timestamptz not null default now()
);
create index if not exists slots_starts_at_idx on slots (starts_at);

-- Booking requests (the intake form). One row per submitted form.
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id        uuid references slots(id) on delete set null,
  plan           text        not null,              -- single | three | monthly
  amount         int         not null,              -- rupees
  name           text        not null,
  age            int,
  gender         text,
  location       text,
  email          text        not null,
  reason         text,
  feelings       text[]      not null default '{}',
  topics         text[]      not null default '{}',
  spoken_before  text,
  language       text,
  desired_outcome text,
  notes          text,
  status         text        not null default 'pending_payment',
                 -- pending_payment | paid | confirmed | cancelled | completed
  meeting_link   text,
  admin_note     text,
  created_at     timestamptz not null default now()
);
create index if not exists bookings_created_at_idx on bookings (created_at desc);

-- Private "just say hello" contact messages.
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_created_at_idx on messages (created_at desc);

-- Row Level Security is enabled; the server uses the service-role key which
-- bypasses RLS. No public policies are defined, so anon clients cannot read/write.
alter table slots    enable row level security;
alter table bookings enable row level security;
alter table messages enable row level security;
