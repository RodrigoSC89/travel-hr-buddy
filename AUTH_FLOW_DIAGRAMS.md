# Authentication Flow Visualization

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              NAUTILUS ONE                                        │
│                         Authentication System                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           Frontend (React)                               │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐    │   │
│  │  │                      App.tsx                                   │    │   │
│  │  │                                                                 │    │   │
│  │  │  ┌──────────────────────────────────────────────────────┐    │    │   │
│  │  │  │           AuthProvider (Context)                     │    │    │   │
│  │  │  │                                                       │    │    │   │
│  │  │  │  • Manages global auth state                        │    │    │   │
│  │  │  │  • Handles session lifecycle                        │    │    │   │
│  │  │  │  • Provides useAuth() hook                          │    │    │   │
│  │  │  │  • Listens to auth state changes                    │    │    │   │
│  │  │  │                                                       │    │    │   │
│  │  │  │  State:                                              │    │    │   │
│  │  │  │    - user: User | null                              │    │    │   │
│  │  │  │    - session: Session | null                        │    │    │   │
│  │  │  │    - isLoading: boolean                             │    │    │   │
│  │  │  │                                                       │    │    │   │
│  │  │  │  Methods:                                            │    │    │   │
│  │  │  │    - signIn(email, password)                        │    │    │   │
│  │  │  │    - signOut()                                      │    │    │   │
│  │  │  │    - signUp(email, password, name)                 │    │    │   │
│  │  │  │    - resetPassword(email)                           │    │    │   │
│  │  │  └───────────────────────────────────────────────────────┘    │    │   │
│  │  │                                                                 │    │   │
│  │  │  ┌──────────────────────────────────────────────────────┐    │    │   │
│  │  │  │              Router (React Router)                   │    │    │   │
│  │  │  │                                                       │    │    │   │
│  │  │  │  ┌─────────────────────────────────────────────┐   │    │    │   │
│  │  │  │  │  /auth (Public Route)                       │   │    │    │   │
│  │  │  │  │  • Login Form                               │   │    │    │   │
│  │  │  │  │  • Signup Form                              │   │    │    │   │
│  │  │  │  │  • Password Reset                           │   │    │    │   │
│  │  │  │  └─────────────────────────────────────────────┘   │    │    │   │
│  │  │  │                                                       │    │    │   │
│  │  │  │  ┌─────────────────────────────────────────────┐   │    │    │   │
│  │  │  │  │  Protected Routes                           │   │    │    │   │
│  │  │  │  │                                             │   │    │    │   │
│  │  │  │  │  ┌──────────────────────────────────┐     │   │    │    │   │
│  │  │  │  │  │   ProtectedRoute Component       │     │   │    │    │   │
│  │  │  │  │  │                                   │     │   │    │    │   │
│  │  │  │  │  │   if (isLoading)                │     │   │    │    │   │
│  │  │  │  │  │     return <LoadingSpinner />   │     │   │    │    │   │
│  │  │  │  │  │                                   │     │   │    │    │   │
│  │  │  │  │  │   if (!user)                    │     │   │    │    │   │
│  │  │  │  │  │     return <Navigate to="/auth"/> │     │   │    │    │   │
│  │  │  │  │  │                                   │     │   │    │    │   │
│  │  │  │  │  │   return <>{children}</>         │     │   │    │    │   │
│  │  │  │  │  └──────────────────────────────────┘     │   │    │    │   │
│  │  │  │  │                                             │   │    │    │   │
│  │  │  │  │  Wrapped Routes:                           │   │    │    │   │
│  │  │  │  │    • / (Home)                              │   │    │    │   │
│  │  │  │  │    • /dashboard                            │   │    │    │   │
│  │  │  │  │    • /admin                                │   │    │    │   │
│  │  │  │  │    • /admin/control-panel                  │   │    │    │   │
│  │  │  │  │    • /admin/api-tester                     │   │    │    │   │
│  │  │  │  │    • ... all other routes                  │   │    │    │   │
│  │  │  │  └─────────────────────────────────────────────┘   │    │    │   │
│  │  │  └───────────────────────────────────────────────────────┘    │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────┐    │   │
│  │  │                    RBAC Components                             │    │   │
│  │  │                                                                 │    │   │
│  │  │  • RoleBasedAccess - UI element wrapper                       │    │   │
│  │  │  • PermissionGuard - Permission-based wrapper                 │    │   │
│  │  │  • usePermissions() - Hook for permission checks              │    │   │
│  │  │                                                                 │    │   │
│  │  │  Supported Roles:                                              │    │   │
│  │  │    - admin (full access)                                       │    │   │
│  │  │    - hr_manager                                                │    │   │
│  │  │    - hr_analyst                                                │    │   │
│  │  │    - department_manager                                        │    │   │
│  │  │    - supervisor                                                │    │   │
│  │  │    - coordinator                                               │    │   │
│  │  │    - manager                                                   │    │   │
│  │  │    - employee (default)                                        │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────┐   │
│  │                  Supabase Backend (Authentication Service)                 │   │
│  │                                                                            │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐    │   │
│  │  │                    Supabase Auth                                  │    │   │
│  │  │                                                                    │    │   │
│  │  │  • User authentication                                           │    │   │
│  │  │  • Session management                                            │    │   │
│  │  │  • Token generation & refresh                                    │    │   │
│  │  │  • Password hashing (bcrypt)                                     │    │   │
│  │  │  • Email verification                                            │    │   │
│  │  │                                                                    │    │   │
│  │  │  Configuration:                                                   │    │   │
│  │  │    - Storage: localStorage                                       │    │   │
│  │  │    - Persist session: true                                       │    │   │
│  │  │    - Auto refresh token: true                                    │    │   │
│  │  │    - Token expiry: 1 hour (default)                             │    │   │
│  │  └──────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                            │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐    │   │
│  │  │                    Database (PostgreSQL)                          │    │   │
│  │  │                                                                    │    │   │
│  │  │  Tables:                                                          │    │   │
│  │  │                                                                    │    │   │
│  │  │  ┌────────────────────────────────────────────────────┐         │    │   │
│  │  │  │  auth.users                                         │         │    │   │
│  │  │  │  • id (uuid, primary key)                          │         │    │   │
│  │  │  │  • email (text)                                    │         │    │   │
│  │  │  │  • encrypted_password (text)                       │         │    │   │
│  │  │  │  • email_confirmed_at (timestamp)                  │         │    │   │
│  │  │  │  • user_metadata (jsonb)                           │         │    │   │
│  │  │  │    └─ role: "admin" | "employee" | ...           │         │    │   │
│  │  │  └────────────────────────────────────────────────────┘         │    │   │
│  │  │                                                                    │    │   │
│  │  │  ┌────────────────────────────────────────────────────┐         │    │   │
│  │  │  │  user_roles                                         │         │    │   │
│  │  │  │  • id (uuid, primary key)                          │         │    │   │
│  │  │  │  • user_id (uuid, foreign key → auth.users)       │         │    │   │
│  │  │  │  • role (text)                                     │         │    │   │
│  │  │  │  • created_at (timestamp)                          │         │    │   │
│  │  │  └────────────────────────────────────────────────────┘         │    │   │
│  │  │                                                                    │    │   │
│  │  │  ┌────────────────────────────────────────────────────┐         │    │   │
│  │  │  │  role_permissions                                   │         │    │   │
│  │  │  │  • id (uuid, primary key)                          │         │    │   │
│  │  │  │  • role (text)                                     │         │    │   │
│  │  │  │  • permission_name (text)                          │         │    │   │
│  │  │  │  • can_read (boolean)                              │         │    │   │
│  │  │  │  • can_write (boolean)                             │         │    │   │
│  │  │  │  • can_delete (boolean)                            │         │    │   │
│  │  │  │  • can_manage (boolean)                            │         │    │   │
│  │  │  └────────────────────────────────────────────────────┘         │    │   │
│  │  │                                                                    │    │   │
│  │  │  ┌────────────────────────────────────────────────────┐         │    │   │
│  │  │  │  profiles                                           │         │    │   │
│  │  │  │  • id (uuid, primary key → auth.users)            │         │    │   │
│  │  │  │  • email (text)                                    │         │    │   │
│  │  │  │  • full_name (text)                                │         │    │   │
│  │  │  │  • avatar_url (text)                               │         │    │   │
│  │  │  │  • department (text)                               │         │    │   │
│  │  │  │  • position (text)                                 │         │    │   │
│  │  │  │  • phone (text)                                    │         │    │   │
│  │  │  └────────────────────────────────────────────────────┘         │    │   │
│  │  └──────────────────────────────────────────────────────────────────┘    │   │
│  └────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Browser Storage                                         │
│                                                                                   │
│  localStorage:                                                                    │
│    ┌───────────────────────────────────────────────────────────────────┐        │
│    │  supabase.auth.token                                              │        │
│    │  {                                                                │        │
│    │    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",     │        │
│    │    refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",    │        │
│    │    expires_at: 1234567890,                                       │        │
│    │    user: {                                                        │        │
│    │      id: "uuid",                                                 │        │
│    │      email: "user@example.com",                                 │        │
│    │      user_metadata: { role: "admin" }                           │        │
│    │    }                                                              │        │
│    │  }                                                                │        │
│    └───────────────────────────────────────────────────────────────────┘        │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

## Authentication Flow Sequence

```
┌──────────┐                                                    ┌──────────────┐
│  User    │                                                    │   Supabase   │
└────┬─────┘                                                    └──────┬───────┘
     │                                                                  │
     │  1. Navigate to /admin                                         │
     ├──────────────────────────────────────────────────────────►    │
     │                                                                  │
     │  2. ProtectedRoute checks auth state                           │
     │     isLoading = true                                            │
     │                                                                  │
     │  3. AuthProvider.useEffect()                                   │
     │     ├─ Setup onAuthStateChange listener                        │
     │     └─ Call getSession()                                       │
     │                                                                  │
     │  4. Request: GET session                                       │
     ├─────────────────────────────────────────────────────────────►  │
     │                                                                  │
     │  5. Check localStorage for token                               │
     │                                                                  │
     │  6. Response: session data (if exists)                         │
     │  ◄─────────────────────────────────────────────────────────────┤
     │                                                                  │
     │  7. Update state:                                              │
     │     ├─ user = session.user                                     │
     │     ├─ session = session                                       │
     │     └─ isLoading = false                                       │
     │                                                                  │
     │  8. ProtectedRoute re-renders                                  │
     │     ├─ if (!user) → <Navigate to="/auth" />                   │
     │     └─ if (user) → render children                            │
     │                                                                  │
     │  IF NOT AUTHENTICATED:                                         │
     │  ─────────────────────                                         │
     │  9. Redirect to /auth                                          │
     │                                                                  │
     │  10. User fills login form                                     │
     │      ├─ email: "user@example.com"                             │
     │      └─ password: "********"                                   │
     │                                                                  │
     │  11. Submit: signIn(email, password)                          │
     ├─────────────────────────────────────────────────────────────►  │
     │                                                                  │
     │  12. Verify credentials                                        │
     │      ├─ Check email exists                                     │
     │      ├─ Compare password hash                                  │
     │      └─ Generate tokens                                        │
     │                                                                  │
     │  13. Response: { user, session }                              │
     │  ◄─────────────────────────────────────────────────────────────┤
     │                                                                  │
     │  14. onAuthStateChange event: "SIGNED_IN"                     │
     │      ├─ Update state                                           │
     │      ├─ Store tokens in localStorage                           │
     │      └─ Show toast: "Bem-vindo!"                              │
     │                                                                  │
     │  15. Auth.tsx checks if (user)                                │
     │      └─ <Navigate to="/" replace />                           │
     │                                                                  │
     │  16. Navigate to home page                                     │
     │                                                                  │
     │  17. Load protected content                                    │
     │                                                                  │
     │  IF ALREADY AUTHENTICATED:                                     │
     │  ────────────────────────                                      │
     │  9. ProtectedRoute allows access                              │
     │                                                                  │
     │  10. Load /admin page content                                 │
     │                                                                  │
     │  11. usePermissions() hook:                                    │
     │      ├─ Query user_roles table                                │
     │      ├─ Fallback to user_metadata.role                        │
     │      └─ Load role permissions                                  │
     │                                                                  │
     │  12. Render UI based on permissions                           │
     │                                                                  │
     └                                                                  ┘

```

## Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                       Session Timeline                           │
└─────────────────────────────────────────────────────────────────┘

Time: 0m              30m                 60m                 90m
      │                │                   │                   │
      │                │                   │                   │
      ▼                ▼                   ▼                   ▼
  ┌─────────┐     ┌─────────┐        ┌─────────┐        ┌─────────┐
  │ LOGIN   │     │ ACTIVE  │        │ REFRESH │        │ ACTIVE  │
  │         │────►│         │───────►│ TOKEN   │───────►│         │
  │ Created │     │ Session │        │         │        │ Session │
  └─────────┘     └─────────┘        └─────────┘        └─────────┘
       │                                   │
       │                                   │
       ├─ access_token (1h expiry)        ├─ New access_token
       ├─ refresh_token                   ├─ Same refresh_token
       └─ Store in localStorage           └─ Update localStorage

  Auto-refresh happens at 50-55 minutes
  User experiences no interruption
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     Error Scenarios                               │
└──────────────────────────────────────────────────────────────────┘

1. Invalid Credentials
   ┌─────────┐      ┌──────────┐      ┌─────────┐
   │ signIn  │─────►│ Supabase │─────►│ Error   │
   │ Submit  │      │ Rejects  │      │ Toast   │
   └─────────┘      └──────────┘      └─────────┘
                          │
                          └─► User stays on /auth
                              No session created

2. Session Expired
   ┌─────────┐      ┌──────────┐      ┌─────────┐
   │ Request │─────►│ Token    │─────►│ Auto    │
   │ Protected│      │ Expired  │      │ Refresh │
   └─────────┘      └──────────┘      └─────────┘
                          │                  │
                          │                  ▼
                          │            ┌─────────┐
                          │            │ Success │
                          │            └─────────┘
                          │                  │
                          │                  └─► Continue
                          │
                          └─► If refresh fails
                              ├─► Clear session
                              ├─► Redirect to /auth
                              └─► Show error toast

3. Network Error
   ┌─────────┐      ┌──────────┐      ┌─────────┐
   │ Request │─────►│ Network  │─────►│ Retry   │
   │ Timeout │      │ Error    │      │ Logic   │
   └─────────┘      └──────────┘      └─────────┘
                          │                  │
                          │                  └─► Show error
                          │                      User can retry
                          │
                          └─► Fallback to cached data

4. Unauthorized Access
   ┌─────────┐      ┌──────────┐      ┌─────────┐
   │ Visit   │─────►│Protected │─────►│ No User │
   │ /admin  │      │ Route    │      │ Found   │
   └─────────┘      └──────────┘      └─────────┘
                                            │
                                            └─► Navigate to /auth
                                                Store return URL
```

## Role-Based Access Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              RBAC Decision Tree                                   │
└──────────────────────────────────────────────────────────────────┘

                      User Authenticated?
                            │
                ┌───────────┴───────────┐
               NO                      YES
                │                       │
                ▼                       ▼
          Redirect to          Check Role Source
            /auth                     │
                            ┌─────────┴─────────┐
                            │                   │
                      Database              user_metadata
                      user_roles                role
                            │                   │
                            └─────────┬─────────┘
                                     │
                              Role Retrieved
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                  admin          hr_manager       employee
                    │                │                │
                    ▼                ▼                ▼
              Full Access    Partial Access    Basic Access
                    │                │                │
                    ├─ All Modules   ├─ HR Module     ├─ View Only
                    ├─ All Perms     ├─ Users: R/W    ├─ No Admin
                    └─ Admin UI      └─ Reports: R    └─ Limited UI

Component Level:
    <RoleBasedAccess roles={["admin"]}>
        ┌─────────────────────────┐
        │ Check userRole          │
        │   ├─ Match? Show content│
        │   └─ No? Show fallback  │
        └─────────────────────────┘
```

---

**Diagram Version:** 1.0  
**Last Updated:** 2024  
**Purpose:** Visual reference for authentication system
