# Selfâ€‘InterviewÂ AIÂ â€“ LayerÂ 1: Frontâ€‘End Design

This document defines the technical design for the frontâ€‘end of **LayerÂ 1** in the selfâ€‘interview AI system.  LayerÂ 1â€™s frontâ€‘end is responsible for all userâ€‘facing interactions, including logging in, uploading rÃ©sumÃ©s and job descriptions, initiating analysis requests, displaying match results and charts, and managing subscription status.  The design builds upon Next.jsÂ 15 with the App Router, leverages **Shadcn UI** for accessible components, uses **Auth0**/Auth.js for authentication, and integrates **Stripe** to handle paid subscriptions.  It is intended for developers who will implement the frontâ€‘end of this project and aligns with the corresponding backend design document.

## Table of Contents

- [1. Scope](#1-scope)
- [2. Architecture Overview](#2-architecture-overview)
  - [2.1 Next.js App Router architecture](#21-nextjs-app-router-architecture)
  - [2.2 Component hierarchy & data flow](#22-component-hierarchy--data-flow)
- [3. Technology Stack](#3-technology-stack)
- [4. Data Flow & State Management](#4-data-flow--state-management)
- [5. Pages & Components](#5-pages--components)
  - [5.1 Upload & Job pages](#51-upload--job-pages)
  - [5.2 Dashboard page](#52-dashboard-page)
  - [5.3 Subscription management](#53-subscription-management)
  - [5.4 Miscellaneous pages](#54-miscellaneous-pages)
- [6. Authentication & User Management](#6-authentication--user-management)
- [7. File Upload Implementation](#7-file-upload-implementation)
- [8. Payment & Pro Membership](#8-payment--pro-membership)
- [9. API Integration & Environment Variables](#9-api-integration--environment-variables)
 - [10. Project Structure & Naming Conventions](#10-project-structure--naming-conventions)
 - [11. Module Descriptions & Highâ€‘Level Pseudocode](#11-module-descriptions--high-level-pseudocode)
 - [12. Testing Strategy](#12-testing-strategy)
   - [12.1 Unit tests](#121-unit-tests)
   - [12.2 Integration and E2E tests](#122-integration-and-e2e-tests)
 - [13. Deployment & DevOps](#13-deployment--devops)
   - [13.1 Running locally](#131-running-locally)
   - [13.2 Docker & Docker Compose](#132-docker--docker-compose)
   - [13.3 Environment & secrets management](#133-environment--secrets-management)
 - [14. Error & Notâ€‘Found Pages](#14-error--not-found-pages)
 - [15. Conclusion & Future Enhancements](#15-conclusion--future-enhancements)

## 1. Scope

The frontâ€‘end for LayerÂ 1 encompasses all clientâ€‘side UI and logic necessary to interact with the backend.  Its primary responsibilities are:

1. **Authentication** â€“ Provide login/logout and session management using Auth0 via Auth.js.  Capture the bearer access token required to authorize calls to the backend API.  Extend the user type to include a `proMember` flag stored in Auth0 appÂ metadata.
2. **File Upload** â€“ Allow users to upload their rÃ©sumÃ© and job description (PDF files).  Send these files to the backend for parsing and analysis via either a server action or a route handler.
3. **Match Analysis** â€“ Trigger the backend to run the AI pipeline, then display the resulting match summary (overall score, strengths, and weaknesses) and render a bar chart comparing requirement importance against candidate similarity.
4. **Subscription Management** â€“ Integrate Stripe to let users upgrade to a paid plan (Pro).  After payment success, update their Auth0 profile to mark them as a pro member so they receive additional features (e.g., more uploads per month or deeper analysis).
5. **User Experience** â€“ Use accessible, responsive UI components from Shadcn UI and TailwindÂ CSS v4 to build a polished interface.  Utilize Next.js builtâ€‘in image optimization via the `<Image />` component to serve company logos or user avatars and follow best practices for width/height and responsive imagesã€136830522410447â€ L599-L603ã€‘.

## 2. Architecture Overview

### 2.1 Next.js App Router architecture

The application uses **Next.jsÂ 15** with the **App Router**.  The AppÂ Router organizes your project under the `app/` directory and supports server components, client components, and route handlers.  Key advantages:

- **Unified routing for pages and APIs:** Route handlers (`route.ts`) can live alongside page components in `app/api`, enabling simple API proxies and server actionsã€185070592111143â€ L68-L73ã€‘.
- **React Server Components (RSC):** By default, files under `app/` are server components; they can fetch data directly from the backend without sending JavaScript to the client.  Client components are annotated with `"use client"` when interactivity (e.g., event handlers) is needed.
- **Server Actions:** Introduced in Next.jsÂ 14, server actions allow sending form data to server code without writing explicit route handlers.  A server action is an async function declared in a server component and attached to a `<form action={uploadFile}>` property; Next.js automatically serializes the form data and passes it to the function.  This pattern is used for file uploads.

### 2.2 Component hierarchy & data flow

At a high level, the application follows the following hierarchy:

* **Root layout (`app/layout.tsx`)** â€“ Defines global HTML structure, includes `AuthProvider` (provided by Auth.js), sets up Tailwind CSS, and provides navigation.
* **Page components** â€“ Each route under `app/` maps to a page.  The main pages are:
  * `/` â€“ Home page with welcome message and callâ€‘toâ€‘action buttons (login, upload rÃ©sumÃ©).
  * `/upload` â€“ Allows uploading rÃ©sumÃ© and job description via a file input (client component) and triggers the upload server action.
  * `/dashboard` â€“ Displays match results after analysis.  Access controlled; only loggedâ€‘in users can view.  Shows match summary, bar chart of requirements vs. candidate similarity, and lists strengths and weaknesses.
  * `/subscribe` â€“ Provides pricing information, integrates with Stripe Checkout, and triggers the subscription flow for upgrading to Pro membership.

Data flows from the server actions and route handlers into server components, which pass it down into client components for interactivity.  Authentication state is provided by Auth.js and accessible via `useSession()`.

## 3. Technology Stack

The frontâ€‘end uses the following technologies:

| Category | Technology | Rationale |
| --- | --- | --- |
| Framework | **Next.jsÂ 15** | Provides SSR/SSG with App Router and server actions. |
| UI | **ShadcnÂ UI + TailwindÂ CSSÂ v4** | ShadcnÂ UI supplies accessible, customizable components; Tailwind offers utility classes.  Install via `pnpm dlx shadcn@latest init` and add components using `pnpm dlx shadcn@latest add button`ã€326458880499963â€ L113-L134ã€‘. |
| Image Optimization | **next/image** | Automatically optimizes images.  Always specify both `width` and `height` (or use the `fill` prop) when rendering images to prevent layout shift and satisfy Next.jsÂ 15 requirementsã€136830522410447â€ L599-L603ã€‘. |
| Authentication | **Auth0** via **Auth.js** (formerly NextAuth) | Handles login, logout, token acquisition, session management and user metadata.  Auth.js integrates well with the App Router. |
| Authorization | **Auth0 roles & appÂ metadata** | Use app metadata to flag pro members. |
| Payments | **Stripe** (Checkout, subscriptions) | Process subscription payments; call Stripe API via route handlers; environment variables for keysã€473298100085991â€ L87-L121ã€‘. |
| State Management | **React Query (TanStack Query)** | Caching and fetching match results and subscription status; works with RSC and client components. |
| Charting | **Recharts** or **Visx** | Render requirement vs. similarity bar chart for match summary. |
| Testing | **Jest + React Testing Library**; **Playwright** for E2E | Provide robust unit and integration tests. |

## 4. Data Flow & State Management

The frontâ€‘end interacts with the backend via HTTP requests.  Key flows:

1. **User authentication** â€“ When a user logs in via Auth0, Auth.js stores an IDÂ token and an access token.  The access token is stored in the session and retrieved via `getAccessToken()` to authorize backend callsã€352685341419756â€ L1647-L1670ã€‘.  The user object includes the `proMember` flag read from appÂ metadata.  If no access token exists, the user sees only limited functionality (e.g., uploading one rÃ©sumÃ©).  Auth.js automatically refreshes tokens and stores them in cookies.
2. **File upload** â€“ The upload form is a client component.  It sends the rÃ©sumÃ© and job description to a server action or route handler (see SectionÂ 7).  The server action stores the files temporarily and forwards them to the backend via the REST API (with the bearer token attached).  The upload page uses React Query to track status.
3. **Match result retrieval** â€“ After file upload, the frontâ€‘end calls `POST /matches` on the backend with rÃ©sumÃ©Id and jobId.  The backend returns a match summary following the JSON structure described in the backend doc.  React Query caches this data and exposes it to the dashboard page.  The dashboard page displays the overall match score and a bar chart comparing requirement importance vs. similarity.
4. **Subscription status** â€“ The `/subscribe` page triggers Stripe Checkout via a route handler.  After success, the route handler calls the backend to mark the userâ€™s `proMember` as true (updating Auth0 app metadata).  On subsequent logins, Auth.js reads the updated metadata and sets `session.user.proMember = true`.

## 5. Pages & Components

### 5.1 Upload & Job pages

These pages allow users to upload their rÃ©sumÃ© and job description.  They share a file upload component that supports PDF dragâ€‘andâ€‘drop and uses React Hook Form with Shadcn UI inputs.  Important features:

- **PDF file input** â€“ Accept only `.pdf` files.  Use the `<input type="file" accept="application/pdf" />` with the `multiple` attribute disabled.  Validate file size and type in the client.
- **Upload server action** â€“ On submit, call a server action `uploadFiles(formData)` declared in a server component.  The action uses `formData.get('resume')` and `get('job')`, reads the array buffers, and sends them to the backend API.  The ProNextJS tutorial demonstrates that a server action receives `formData`, extracts the file with `formData.get('file')`, converts it to a byte array via `file.arrayBuffer()`, and writes it to disk or forwards itã€127666406152120â€ L32-L50ã€‘.
- **Form state** â€“ Use React Hook Form and Zod validation to provide instant feedback and error messages.  Shadcn UI provides `Input`, `Label`, `Button`, and `Toast` components for consistent styling.
- **Navigation** â€“ On successful upload, redirect the user to the dashboard page and pass the returned `matchId` as a query parameter.

### 5.2 Dashboard page

The dashboard displays the match summary and charts.  Components include:

- **Overall Score Display** â€“ Shows a gauge or numeric indicator of the overall match score (0â€“1).  Use Shadcn `Card` and `Progress` components.
- **Bar chart** â€“ Use Rechartsâ€™ `<BarChart>` to plot requirement importance (yâ€‘axis) vs. similarity scores (xâ€‘axis).  Provide axis labels and a legend.  The xâ€‘axis lists requirement names; the yâ€‘axis shows normalized weights and similarity.  Adjust colors to match the theme.
- **Strengths & weaknesses lists** â€“ Two lists: strengths (green icons) and weaknesses (red icons).  Each item shows requirement name, importance weight and similarity score.
- **Download report** â€“ Optionally allow Pro users to download a PDF report of the match summary.

### 5.3 Subscription management

This page uses the Stripe client library to initiate checkout sessions.  Key elements:

- **Product plan** â€“ Display free vs. Pro features.  Use Shadcn `Card` and `Button` components.
- **Checkout button** â€“ When clicked, call a server action or route handler that creates a Stripe Checkout session using the secret key and returns the session URL.  Redirect the user to Stripe Checkout.  After payment success, the server webhook updates the userâ€™s metadata.  The environment variables for Stripe keys should be set in `.env.local`ã€473298100085991â€ L87-L121ã€‘.
- **Handling webhooks** â€“ A backend route handler listens to Stripe webhooks for `checkout.session.completed`.  On success, update the userâ€™s `proMember` status in Auth0 via the backend.

### 5.4 Miscellaneous pages

- **Login page** â€“ Implemented by Auth.js; may redirect to Auth0â€™s universal login page.  Include a login button and call `signIn()`.
- **Logout page** â€“ Provide a logout link that calls `signOut()` from Auth.js and returns to the homepage.
- **404 / error pages** â€“ Use builtâ€‘in `not-found.tsx` and `error.tsx` for custom error messages.

## 6. Authentication & User Management

Authentication is handled by **Auth.js** using Auth0 as an identity provider.  Setup includes:

1. **Install dependencies** â€“ `npm install @auth0/nextjs-auth0` or `npm install authjs` (the new name).  Ensure `dotenv` is installed to load environment variables.
2. **Configure Auth.js** â€“ Create `/app/api/auth/[...auth]/route.ts` that exports `AuthHandler` with your Auth0 credentials.  The Auth0 quickstart instructs storing `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE` and `API_SERVER_URL` in `.env.local`ã€352685341419756â€ L1741-L1759ã€‘.
3. **Protecting pages** â€“ Use `getSession()` in server components to check if the user is authenticated.  If not, redirect to login.  In client components, use the `useSession()` hook to get the user and token.
4. **Fetching bearer tokens** â€“ Use `getAccessToken()` (server) or `getToken()` (client) from Auth.js to obtain the access token and include it in the `Authorization` header when calling the backendã€352685341419756â€ L1647-L1670ã€‘.
5. **Custom user type & session** â€“ Extend the default `User` interface provided by Auth.js/NextAuth to include a `proMember` flag and any other fields you wish to expose (e.g., roles, subscription dates).  In `auth.ts`, define a type such as `interface AppUser extends User { proMember: boolean }` and use it to strongly type your session.  Then implement a `session` callback that injects values from Auth0 **appÂ metadata** into the returned session:

```ts
callbacks: {
  async session({ session, token, user }) {
    // Extract pro status from app metadata on the token (set by the backend when payment succeeds)
    session.user = {
      ...session.user,
      proMember: token.proMember ?? false,
    } as AppUser;
    // Persist the bearer access token on the session so it can be used by the fetch wrapper
    session.accessToken = token.accessToken;
    return session;
  },
  async jwt({ token, user, account }) {
    // Include Auth0 app metadata in the token (requires the Auth0 profile to include app_metadata)
    if (user) {
      token.proMember = user.app_metadata?.proMember ?? false;
    }
    return token;
  },
}
```

With this configuration, `session.accessToken` holds the bearer token for backend requests and `session.user.proMember` exposes the subscription status throughout the app.  Remember to update your TypeScript types (`Session` and `User`) accordingly.
6. **Updating membership status** â€“ After Stripe checkout success, the backend updates the userâ€™s `app_metadata.proMember` via Auth0 Management API.  On the next login (or token refresh), Auth.js picks up the new flag.

## 7. File Upload Implementation

File upload can be implemented using either **server actions** or **route handlers**.  Both accept `FormData` with `File` objects.  The ProNextJS tutorial demonstrates extracting the file from `formData` and converting it to an array buffer before writing it to disk or forwarding it to the backendã€127666406152120â€ L32-L50ã€‘.  We will forward the files to the backend API rather than storing them locally.

### 7.1 Server action

```tsx
// app/upload/page.tsx (server component)

// declare server action in the same file
export async function uploadFiles(formData: FormData) {
  'use server';
  const resume: File | null = formData.get('resume') as unknown as File;
  const job: File | null = formData.get('job') as unknown as File;
  if (!resume || !job) {
    throw new Error('Missing files');
  }
  // Convert to Uint8Array for streaming
  const resumeBytes = new Uint8Array(await resume.arrayBuffer());
  const jobBytes = new Uint8Array(await job.arrayBuffer());

  // Obtain access token
  const { accessToken } = await getAccessToken();

  // Send to backend
  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resumes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/pdf',
      Authorization: `Bearer ${accessToken}`,
    },
    body: Buffer.from(resumeBytes),
  });
  // Similarly send job
  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/pdf',
      Authorization: `Bearer ${accessToken}`,
    },
    body: Buffer.from(jobBytes),
  });
  // After uploading both files, request matching
  const matchRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/matches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ resumeId: 'uuid1', jobId: 'uuid2' }),
  });
  const matchSummary = await matchRes.json();
  // Return match summary to page
  return matchSummary;
}

// Client component to display form
import { useTransition } from 'react';
import { Button, Input, Label } from '@/components/ui';

export default function UploadPage() {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await uploadFiles(formData);
        })
      }
      className="space-y-4"
    >
      <Label htmlFor="resume">Upload rÃ©sumÃ©</Label>
      <Input id="resume" name="resume" type="file" accept="application/pdf" />
      <Label htmlFor="job">Upload job description</Label>
      <Input id="job" name="job" type="file" accept="application/pdf" />
      <Button type="submit" disabled={isPending}>Analyze</Button>
    </form>
  );
}
```

### 7.2 Route handler

Alternatively, you can implement an API route handler to process uploads.  In Next.jsÂ 15, route handlers must always return a `Response` object and any data extraction from the `Request` (like `formData()` or `json()`) is asynchronous.  Create `app/api/upload/route.ts` and export a `POST()` function to handle the request:

```ts
// app/api/upload/route.ts
import { NextRequest } from 'next/server';
import { getAccessToken } from '@auth0/nextjs-auth0';

export async function POST(req: NextRequest) {
  // In Next.jsÂ 15 the `formData()` method returns a Promise; always await it.
  const formData = await req.formData();
  const resume = formData.get('resume') as File | null;
  const job = formData.get('job') as File | null;
  if (!resume || !job) {
    return new Response('Missing files', { status: 400 });
  }
  const resumeBytes = new Uint8Array(await resume.arrayBuffer());
  const jobBytes = new Uint8Array(await job.arrayBuffer());
  const { accessToken } = await getAccessToken();
  // Forward to backend via fetch as above...
  // ...
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
```

## 8. Payment & Pro Membership

Stripe integration is required to enable paid subscriptions.  The following steps outline the process:

1. **Install Stripe packages** â€“ `npm install stripe @stripe/stripe-js @stripe/react-stripe-js`ã€473298100085991â€ L172-L178ã€‘.  Use `stripe` on the server and `@stripe/react-stripe-js` for client components.
2. **Configure environment variables** â€“ Create `.env.local` with keys: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `NEXT_PUBLIC_APP_URL`ã€473298100085991â€ L104-L111ã€‘.  Client variables must start with `NEXT_PUBLIC_`.
3. **Create checkout sessions** â€“ Implement a route handler `app/api/stripe/checkout/route.ts` with `POST()` to create a Stripe checkout session using the `stripe` server SDK.  Pass the current userâ€™s Auth0 `sub` or `userId` as metadata in the session.  The handler should return the session URL.
4. **Redirect to Stripe Checkout** â€“ In the `/subscribe` page, call the checkout API and redirect the user to the returned URL using `window.location.assign(url)`.
5. **Handle webhooks** â€“ Add a route handler `app/api/stripe/webhook/route.ts` that listens for events from Stripe.  On `checkout.session.completed`, extract the user ID from session metadata, then call the backend or Auth0 Management API to set `app_metadata.proMember = true`.
6. **Update UI** â€“ After payment, refresh the session to reflect the new membership status.  The navigation bar should show â€œPro Memberâ€ or â€œUpgradeâ€ accordingly.

## 9. API Integration & Environment Variables

All frontâ€‘end requests to the backend must include the bearer access token and respect environment configuration.  Keys:

- `NEXT_PUBLIC_BACKEND_URL` â€“ The base URL of the backend API (e.g., `http://localhost:3001`).
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` â€“ Clientâ€‘side Stripe key.
- `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE`, `AUTH0_SECRET` â€“ Auth0 configuration valuesã€352685341419756â€ L1741-L1759ã€‘.
- `NEXT_PUBLIC_APP_URL` â€“ The frontâ€‘end base URL used for Stripe redirect URLs.
 - `NEXT_PUBLIC_FEATURE_LIMIT` â€“ Feature limit for free users; read from env to allow configuration.
 - `AUTH0_M2M_CLIENT_ID` & `AUTH0_M2M_CLIENT_SECRET` â€“ Client credentials for obtaining a Management API token.  Used by the Auth0 management service (server only).

## 10. Project Structure & Naming Conventions

We recommend the following directory layout for a clean and maintainable frontâ€‘end project.  It separates concerns into **features**, **modules**, **services**, and **auth** folders so developers can navigate easily and find server actions, UI components, and domain logic in predictable locations.  The guiding principle is that **server actions** and other serverâ€‘side logic live in a `modules` subfolder, and **presentational components** live in a `components` subfolder, scoped to the feature they support.  External integrations (Stripe, Auth0 management) live in the `services/` folder.  Authentication configuration and route protection live in the `auth/` folder as recommended by the latest Auth.js documentationã€331673990590902â€ L1548-L1563ã€‘.

```text
src/
  app/                     # Next.js App Router directory
    layout.tsx            # Root layout (includes AuthProvider, ThemeProvider, global CSS)
    page.tsx              # Home page
    error.tsx             # Global error boundary (renders on unhandled exceptions)
    not-found.tsx         # Custom 404 page
    api/                  # Route handlers for serverless functions
      stripe/
        webhook/route.ts  # Stripe webhook listener (server-only)
      auth/
        [...nextauth]/route.ts # Exposes Auth.js handlers GET/POST by reâ€‘exporting from auth/auth.ts

  features/               # Domain features organised by user stories; each feature isolates UI and server actions
    upload/
      page.tsx           # Upload RÃ©sumÃ© & Job page (server component)
      components/        # Presentational components specific to uploading (client components)
        UploadForm.tsx
      modules/           # Server actions & business logic related to uploading
        uploadFiles.ts   # Calls backend API to store files

    dashboard/
      page.tsx           # Dashboard page
      components/
        ScoreCard.tsx
        Chart.tsx
        StrengthList.tsx
        WeaknessList.tsx
      hooks/
        useMatch.ts      # Fetch match results via React Query
      modules/           # Server actions for dashboard (e.g. mark as read)

    subscription/
      page.tsx           # Subscription & pricing page
      modules/
        createCheckoutSession.ts # Server action to initiate Stripe Checkout
      components/
        PlanCard.tsx      # Pricing card component

    auth0-management/
      # Feature dedicated to calling Auth0 Management API for creating and updating users
      modules/
        createUser.ts    # Server action calling Auth0 Management API to create a user
        updateUser.ts    # Server action calling Auth0 Management API to update user metadata

  modules/                # Shared server actions not tied to a single feature (optional)
    uploadFiles.ts        # Example: wrapper for upload server action used by pages
    createMatch.ts        # Example: calls backend /matches endpoint

  services/               # External services and SDK wrappers
    stripe.ts             # Stripe client & helper functions (client side)
    auth0.ts              # Auth0 Management API helper (server side; uses env credentials)

  auth/
    auth.ts               # NextAuth.js configuration exporting handlers (GET/POST), and `auth()` helperã€331673990590902â€ L1548-L1563ã€‘
    middleware.ts         # Next.js middleware using `auth` to protect routesã€331673990590902â€ L1548-L1563ã€‘

  components/             # Reusable UI components shared across features
    ui/                   # Shadcn UI primitives (Button, Input, Card, etc.)
    ImageWrapper.tsx      # Wrapper around next/image with default sizing

  hooks/                  # Shared hooks (client side)
    useAuth.ts            # Wrap Auth.js hooks to get user and token
    useFetch.ts           # Generic data fetching hook with bearer token

  lib/                    # Generic utilities (non-React)
    api.ts                # Wrapper around fetch that injects bearer token

  styles/
    globals.css           # Tailwind & Shadcn overrides

  tests/
    unit/                 # Component and hook tests (Jest)
    e2e/                  # Endâ€‘toâ€‘end tests (Playwright)

  public/                 # Static assets and fallback images
  .env.local              # Environment variables (not committed)
  README.md               # Project overview and setup instructions
```

Naming conventions:

* Use **PascalCase** for React component and class names (`UploadForm.tsx`), **camelCase** for variables and functions (`useMatch`, `fetchMatch`), and **snake_case** only for file names within the `modules/` folder when they export a single server action (e.g., `upload_files.ts`).
* Use **kebab-case** for route segments (`dashboard`, `subscription`), aligning folder names with the route path.
* Keep component files small and focused; avoid large monolithic components.
* Place server actions and heavy business logic in the `modules/` folder of a feature or the root `modules/` folder, rather than embedding them in page files.  This makes them easily testable and reusable.

## 11. Module Descriptions & Highâ€‘Level Pseudocode

This section describes each key module with inputs, outputs, and pseudocode to guide implementation.

### 11.1 `useAuth` custom hook

**Purpose:** Provide a unified API for authentication state and token retrieval.

```ts
// hooks/useAuth.ts
import { useSession, getAccessToken } from '@auth0/nextjs-auth0/client';

export function useAuth() {
  const { user, error, isLoading } = useSession();
  const getToken = async () => {
    const token = await getAccessToken();
    return token.accessToken;
  };
  return { user, error, isLoading, getToken };
}
```

### 11.2 `useMatch` hook

**Purpose:** Fetch match summary from the backend and cache it.

```ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export function useMatch(matchId: string) {
  const { getToken } = useAuth();
  return useQuery(['match', matchId], async () => {
    const token = await getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/matches/${matchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch match');
    return res.json();
  });
}
```

### 11.3 Stripe integration helpers

```ts
// lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any> | null = null;
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}

// Initiate checkout from client component
import { getStripe } from '@/lib/stripe';

export async function redirectToCheckout(sessionId: string) {
  const stripe = await getStripe();
  await stripe?.redirectToCheckout({ sessionId });
}
```

### 11.4 File upload form component

Pseudocode for a client component that handles file selection and triggers a server action:

```tsx
// components/UploadForm.tsx
'use client';
import { useState } from 'react';
import { uploadFiles } from '@/app/upload/page'; // import server action proxy

export default function UploadForm() {
  const [resume, setResume] = useState<File | null>(null);
  const [job, setJob] = useState<File | null>(null);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resume || !job) return;
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('job', job);
    await uploadFiles(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="file" accept="application/pdf" onChange={(e) => setResume(e.target.files?.[0] ?? null)} />
      <input type="file" accept="application/pdf" onChange={(e) => setJob(e.target.files?.[0] ?? null)} />
      <button type="submit">Analyze</button>
    </form>
  );
}
```

### 11.5 Match dashboard component

Pseudocode for the dashboard page showing the bar chart and lists:

```tsx
// app/dashboard/page.tsx
import { useSearchParams } from 'next/navigation';
import { useMatch } from '@/hooks/useMatch';
import Chart from '@/components/Chart';
import StrengthList from '@/components/StrengthList';
import WeaknessList from '@/components/WeaknessList';

export default function DashboardPage() {
  const params = useSearchParams();
  const matchId = params.get('matchId');
  const { data: match, isLoading, error } = useMatch(matchId ?? '');
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading match</p>;
  return (
    <div>
      <h2>Match Score: {match.overall_match_score.toFixed(2)}</h2>
      <Chart data={match.requirements} />
      <StrengthList items={match.strengths} />
      <WeaknessList items={match.weaknesses} />
    </div>
  );
}
```

### 11.6 Auth0 management service (`services/auth0.ts` and feature modules)

When users upgrade to a Pro subscription or when user metadata needs to be synchronised, the frontâ€‘end must call the **Auth0 Management API**.  These calls require a machineâ€‘toâ€‘machine token and therefore must run on the server (server action or route handler).

**Inputs and outputs**

* `createUser(email: string, password: string, metadata?: Record<string, any>)` â†’ promise resolving to the created Auth0 user.
* `updateUser(userId: string, metadata: Record<string, any>)` â†’ promise resolving to the updated Auth0 user.

**Highâ€‘level steps**

1. Obtain a management token by sending your `AUTH0_M2M_CLIENT_ID` and `AUTH0_M2M_CLIENT_SECRET` to the `/oauth/token` endpoint with the audience `https://YOUR_DOMAIN/api/v2/`ã€331673990590902â€ L1548-L1563ã€‘.
2. Create a user by POSTing to `/api/v2/users` with the connection, email, password and `app_metadata` (e.g., `{ proMember: false }`).
3. Update a user by PATCHing `/api/v2/users/{userId}` with the new `app_metadata` (e.g., `{ proMember: true }`).

**Pseudocode**

```ts
// services/auth0.ts
export async function getManagementToken() {
  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });
  const { access_token } = await res.json();
  return access_token as string;
}

export async function createUser(email: string, password: string, metadata: any) {
  const token = await getManagementToken();
  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      connection: 'Username-Password-Authentication',
      email,
      password,
      email_verified: false,
      app_metadata: metadata,
    }),
  });
  return res.json();
}

export async function updateUser(userId: string, metadata: any) {
  const token = await getManagementToken();
  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_metadata: metadata,
    }),
  });
  return res.json();
}
```

Store `AUTH0_M2M_CLIENT_ID`, `AUTH0_M2M_CLIENT_SECRET` and `AUTH0_DOMAIN` in `.env.local`.  Use these helpers in Stripe webhooks or server actions to update a userâ€™s `proMember` status.

### 11.7 Auth configuration & middleware (`auth/auth.ts` and `auth/middleware.ts`)

The **auth** folder contains your NextAuth.js (Auth.js) configuration and middleware.  The Auth.js docs recommend initialising NextAuth in an `auth.ts` file and exporting both the handlers and an `auth()` helperã€331673990590902â€ L1548-L1563ã€‘ã€331673990590902â€ L1660-L1670ã€‘.

**auth/auth.ts** â€“ Create and export your NextAuth configuration:

```ts
import NextAuth from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER_BASE_URL!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = {
        ...session.user,
        proMember: token.proMember ?? false,
      };
      (session as any).accessToken = token.accessToken;
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
});
```

**auth/middleware.ts** â€“ Reâ€‘export `auth` to protect routes.  Optionally customise the matcher to exclude static assets and API routesã€331673990590902â€ L1548-L1563ã€‘:

```ts
export { auth as middleware } from './auth';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
};
```

With this setup you can call `const { user } = await auth()` inside server components and route handlers.  Your `app/api/auth/[...nextauth]/route.ts` file should reâ€‘export the handlers: `export { GET, POST } from '@/auth/auth'`.

## 12. Testing Strategy

### 12.1 Unit tests

1. **Component tests** â€“ Use **Jest** with **React Testing Library** to test individual components (UploadForm, ScoreCard, Chart, StrengthList).  Mock server actions using `jest.mock()` and verify that callbacks are invoked with the correct form data and state updates.
2. **Custom hooks** â€“ Test `useAuth` and `useMatch` to ensure they fetch tokens and data correctly.  Use `msw` (Mock Service Worker) to mock backend responses.
3. **Utility functions** â€“ Test helpers in `lib/api.ts` and `lib/stripe.ts`, ensuring they generate correct headers, handle errors, and call `loadStripe()` once.

### 12.2 Integration and E2E tests

1. **API interaction tests** â€“ Use Jest with `supertest` to test route handlers (e.g., `/api/upload`, `/api/stripe/checkout`) in isolation.  Mock Auth0 and Stripe modules to simulate successful authentication and payment flows.
2. **Endâ€‘toâ€‘end tests** â€“ Use **Playwright** to automate the full user journey: login, upload files, view match results, subscribe to Pro, and verify membership status.  Use the sample test files from the `test_data` folder (e.g., `resume_simple.pdf`, `resume_complex.pdf`, `job_basic.json`, `job_infer.json`, `match_expected.json`).
3. **Accessibility tests** â€“ Use Playwrightâ€‘accessibility or Axe to verify that pages conform to WCAGÂ 2.1Â AA standards (contrast, alt text, keyboard navigation).

## 13. Deployment & DevOps

### 13.1 Running locally

To run the frontâ€‘end locally:

1. Install dependencies: `npm install` or `pnpm install`.
2. Copy `.env.example` to `.env.local` and fill in values for Auth0 and Stripe keys, plus `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_APP_URL`.
3. Start the development server: `npm run dev`.  The app will be accessible at `http://localhost:3000`.

### 13.2 Docker & Docker Compose

Define a simple `Dockerfile` for the frontâ€‘end:

```dockerfile
# Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json ./
COPY ./node_modules ./node_modules
EXPOSE 3000
CMD ["node", "./node_modules/next/dist/bin/next", "start"]
```

Then add the service to the `docker-compose.yml` used in the backend design:

```yaml
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://backend:3001
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      - AUTH0_BASE_URL=${AUTH0_BASE_URL}
      - AUTH0_ISSUER_BASE_URL=${AUTH0_ISSUER_BASE_URL}
      - AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}
      - AUTH0_CLIENT_SECRET=${AUTH0_CLIENT_SECRET}
      - AUTH0_AUDIENCE=${AUTH0_AUDIENCE}
      - AUTH0_SECRET=${AUTH0_SECRET}
      - NEXT_PUBLIC_FEATURE_LIMIT=${NEXT_PUBLIC_FEATURE_LIMIT}
    depends_on:
      - backend
```

Ensure that the backend container is accessible via the service name `backend`.  The `depends_on` clause ensures the backend starts before the frontâ€‘end.

### 13.3 Environment & secrets management

Store sensitive credentials in `.env.local` for local development and environment variables in your deployment platform (Vercel, Docker Compose, Azure Web Apps).  Never commit secret keys.  Use the `NEXT_PUBLIC_` prefix only for values required by the client (e.g., Stripe publishable key, backend URL).

## 14. Error & Notâ€‘Found Pages

Next.js allows you to define custom error and 404 pages to improve the user experience when something goes wrong.  You should implement these at the root of the `app/` directory so they apply to all routes.

### 14.1 Error page (`app/error.tsx`)

The `app/error.tsx` file is a **server component** that acts as a global error boundary.  It renders whenever an unhandled exception occurs in a server component or server action.  You can display a friendly message and provide a retry button that resets the error state.

**Pseudocode**

```tsx
// app/error.tsx
'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  // You can log the error or send it to an error tracking service here
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
      <p className="mb-4">An unexpected error occurred. Please try again.</p>
      <button className="btn btn-primary" onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 14.2 Not Found page (`app/not-found.tsx`)

The `app/not-found.tsx` file defines the UI for 404 pages.  Whenever a user navigates to a route that does not exist, Next.js automatically renders this component.  It can offer navigation back to the home page or upload page.

**Pseudocode**

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="mb-4">We couldn't find the page you're looking for.</p>
      <a href="/" className="text-blue-600 underline">Go back home</a>
    </div>
  );
}
```

By defining these two files you ensure that unexpected errors and missing routes are handled gracefully and consistently across the application.

## 15. Conclusion & Future Enhancements

This design document outlines a complete frontâ€‘end architecture for LayerÂ 1 of the selfâ€‘interview AI.  By adhering to the file structure, coding conventions, and pseudocode provided, a junior developer can implement each module without needing deep context from other parts of the system.  Key design principles include leveraging modern Next.js features (App Router, server actions, server components), using Auth0 for secure authentication and role management, integrating Stripe for monetization, and employing Shadcn UI for accessible components.  Future enhancements may include:

* **Progressive Web App (PWA) support** â€“ to enable offline access to match history.
* **Internationalization** â€“ using `next-intl` or `next-translate` to support multiple languages.
* **Advanced analytics** â€“ tracking user engagement and conversion rates via Vercel Analytics.
* **Accessibility improvements** â€“ continuous evaluation to meet WCAGÂ 2.2 guidelines.
