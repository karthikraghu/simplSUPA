# MemoryBox

A secure journaling application using Next.js and Supabase.

## Setup

1.  **Framework Setup**:
    The project is already initialized with Next.js, Tailwind CSS, and TypeScript.

2.  **Environment Variables**:
    Rename `.env.local.example` to `.env.local` and add your keys from the Supabase Dashboard:
    ```bash
    cp .env.local.example .env.local
    ```
    Then edit `.env.local`:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```

3.  **Supabase Database Setup**:
    Run the following SQL in your Supabase SQL Editor to create the entries table:
    ```sql
    create table entries (
      id uuid default uuid_generate_v4() primary key,
      user_id uuid references auth.users not null,
      content text,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    alter table entries enable row level security;

    create policy "Users can create their own entries"
    on entries for insert
    with check ( auth.uid() = user_id );

    create policy "Users can view their own entries"
    on entries for select
    using ( auth.uid() = user_id );
    ```

4.  **Run the App**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Tech Stack
-   **Frontend**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS
-   **Backend**: Supabase (Auth & Database)
-   **Language**: TypeScript
