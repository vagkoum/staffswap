# StaffSwap — Setup Guide
### No coding knowledge needed. Follow these steps in order.

---

## What you'll need (all free)
- A computer (Mac or Windows)
- A free Supabase account → https://supabase.com
- A free Vercel account → https://vercel.com
- A free GitHub account → https://github.com

---

## Step 1 — Set up your database (Supabase)

1. Go to https://supabase.com and click **Start your project** (sign up for free)
2. Click **New project**, give it a name (e.g. "staffswap"), set a password, click **Create**
3. Wait about 1 minute for it to load
4. Click **SQL Editor** in the left sidebar
5. Click **New query**
6. Copy and paste ALL of the text below into the box, then click **Run**:

```sql
-- User profiles
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  company text,
  bio text,
  location text,
  created_at timestamp with time zone default now()
);

-- Listings
create table listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  offer_title text not null,
  offer_description text,
  seek_description text,
  skills text,
  category text,
  availability text,
  location text,
  user_type text default 'individual',
  trade_type text default 'both',
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Message threads
create table message_threads (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references profiles(id),
  user2_id uuid references profiles(id),
  listing_id uuid references listings(id),
  created_at timestamp with time zone default now()
);

-- Messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references message_threads(id) on delete cascade,
  sender_id uuid references profiles(id),
  receiver_id uuid references profiles(id),
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Allow users to read/write their own data
alter table profiles enable row level security;
alter table listings enable row level security;
alter table message_threads enable row level security;
alter table messages enable row level security;

create policy "Public profiles" on profiles for select using (true);
create policy "Own profile" on profiles for all using (auth.uid() = id);

create policy "Public listings" on listings for select using (true);
create policy "Own listings" on listings for all using (auth.uid() = user_id);

create policy "Thread participants" on message_threads for all
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Message participants" on messages for all
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

7. You should see "Success. No rows returned." — that means it worked!

---

## Step 2 — Get your Supabase keys

1. In Supabase, click **Settings** (gear icon, bottom left)
2. Click **API**
3. You'll see two values — copy them somewhere safe:
   - **Project URL** (looks like: https://abcdefgh.supabase.co)
   - **anon public key** (a long string of letters and numbers)

---

## Step 3 — Add your keys to the app

1. Open the file: `src/lib/supabase.js`
2. Replace `https://YOUR_PROJECT_ID.supabase.co` with your **Project URL**
3. Replace `YOUR_ANON_KEY_HERE` with your **anon public key**
4. Save the file

---

## Step 4 — Customise your platform (optional but recommended)

Open the file: `src/lib/tradeConfig.js`

You can change:
- `platformName` — the name of your platform (e.g. "ShiftSwap" or "SkillShare")
- `heroTagline` — the headline on the home page
- `categories` — what categories users can pick
- `tradeNoun` — what's being traded (e.g. "shifts", "services", "skills")
- Everything else is explained with comments in the file

---

## Step 5 — Put the app online (Vercel)

**Option A — Easiest (drag and drop):**
1. Go to https://vercel.com and sign up (free)
2. Click **Add New → Project**
3. Choose **Import from GitHub** — first upload your folder to GitHub:
   - Go to https://github.com, create a new repository (call it "staffswap")
   - Upload all your files there
4. In Vercel, select your repository and click **Deploy**
5. Wait 2 minutes — your site will be live at a free `.vercel.app` URL!

**Option B — Via command line (if you have a developer helping you):**
```bash
cd staffswap
npm install
npm run build
npx vercel --prod
```

---

## Step 6 — You're live! 🎉

Share your Vercel URL with people. They can:
- Sign up and create a profile
- Post listings of what they're offering
- Browse and filter other listings
- See their best matches automatically
- Message other users directly

---

## How to change what's being traded later

Just open `src/lib/tradeConfig.js`, edit the words, and re-deploy to Vercel (Vercel auto-redeploys when you push to GitHub).

No other files need to be touched.

---

## Getting help

If something doesn't work, you can:
- Come back to Claude and paste the error message — it can help you fix it
- Check the Supabase docs: https://supabase.com/docs
- Check the Vercel docs: https://vercel.com/docs
