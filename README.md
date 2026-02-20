# Reservation Management System - Full Stack Crash Course

A full-stack CRUD application built with .NET 10 (C#) backend and Next.js 16 (React/TypeScript) frontend. This project demonstrates modern web development practices, RESTful API design, and real-world bug fixing.

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Backend (.NET API)](#backend-net-api)
- [Frontend (Next.js)](#frontend-nextjs)
- [How They Communicate](#how-they-communicate)
- [Database Setup](#database-setup)
- [Bugs Fixed](#bugs-fixed)
- [Running the Project](#running-the-project)
- [Interview Key Points](#interview-key-points)

---

## 🛠 Tech Stack

### Backend
- **.NET 10** - Latest C# framework for building web APIs
- **ASP.NET Core** - Web framework
- **Entity Framework Core 10** - ORM for database operations
- **SQL Server** - Relational database
- **Swagger/OpenAPI** - API documentation

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **SCSS Modules** - Scoped styling
- **Turbopack** - Fast bundler

---

## 🏗 Architecture Overview

```
┌─────────────────┐         HTTP/REST         ┌─────────────────┐
│                 │  ←────────────────────→   │                 │
│  Next.js App    │    JSON (Port 5299)       │   .NET API      │
│  (Port 3000)    │                            │                 │
│                 │                            │                 │
└─────────────────┘                            └────────┬────────┘
                                                        │
                                                        │ Entity Framework
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │   SQL Server    │
                                                │  ReservationsDb │
                                                └─────────────────┘
```

### Request Flow Example (Creating a Reservation)
1. User fills out form in React component
2. `createReservation()` in `api.ts` sends POST request
3. Request hits `/api/reservations` endpoint
4. `ReservationsController.CreateReservation()` receives data
5. Entity Framework adds to `DbContext`
6. `SaveChangesAsync()` commits to SQL Server
7. API returns created reservation with 201 status
8. Frontend updates UI and navigates to list

---

## 🔧 Backend (.NET API)

### Project Structure
```
backend/ReservationApi/
├── Controllers/
│   └── ReservationsController.cs    # HTTP endpoints
├── Data/
│   └── AppDbContext.cs              # EF Core DbContext
├── Models/
│   └── Reservation.cs               # Entity model
├── Migrations/                      # Database schema versions
├── Program.cs                       # App configuration
└── appsettings.json                # Configuration (connection strings)
```

### Key Components

#### 1. **Program.cs** - Application Entry Point
```csharp
var builder = WebApplication.CreateBuilder(args);

// Register services in Dependency Injection container
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS policy - allows frontend to call API
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");  // CRITICAL: Must activate CORS
app.MapControllers();           // Map controller routes
app.Run();
```

**Interview Note**: Middleware order matters! CORS must come before authorization.

#### 2. **Models/Reservation.cs** - Data Entity
```csharp
public class Reservation
{
    public int Id { get; set; }                    // Primary key (auto-incremented)
    public string MemberName { get; set; }         
    public string Destination { get; set; }        
    public DateTime StartDate { get; set; }        
    public DateTime EndDate { get; set; }          
    public string Status { get; set; } = "pending"; // Default value
}
```

**Interview Note**: EF Core uses conventions - `Id` is automatically the primary key.

#### 3. **Data/AppDbContext.cs** - Database Context
```csharp
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) 
        : base(options) { }

    public DbSet<Reservation> Reservations => Set<Reservation>();
}
```

**What's happening**: 
- Inherits from `DbContext` (EF Core)
- `DbSet<Reservation>` represents the table in SQL Server
- EF Core tracks changes to entities and generates SQL

#### 4. **Controllers/ReservationsController.cs** - API Endpoints
```csharp
[ApiController]
[Route("api/[controller]")]  // Results in /api/reservations
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _context;

    // Dependency Injection provides DbContext
    public ReservationsController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/reservations
    [HttpGet]
    public async Task<IActionResult> GetReservations()
    {
        return Ok(await _context.Reservations.ToListAsync());
    }

    // GET /api/reservations/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetReservation(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        return reservation == null ? NotFound() : Ok(reservation);
    }

    // POST /api/reservations
    [HttpPost]
    public async Task<IActionResult> CreateReservation(Reservation reservation)
    {
        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetReservation), 
            new { id = reservation.Id }, reservation);
    }

    // PUT /api/reservations/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReservation(int id, Reservation updated)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null) return NotFound();

        reservation.MemberName = updated.MemberName;
        reservation.Destination = updated.Destination;
        reservation.StartDate = updated.StartDate;
        reservation.EndDate = updated.EndDate;
        reservation.Status = updated.Status;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/reservations/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReservation(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null) return NotFound();

        _context.Reservations.Remove(reservation);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
```

**Interview Notes**:
- **Async/await** prevents thread blocking during I/O operations
- **RESTful conventions**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Status codes**: 200 OK, 201 Created, 204 No Content, 404 Not Found
- **Model binding**: ASP.NET automatically deserializes JSON to C# objects

### Entity Framework Migrations

```bash
# Create migration (tracks schema changes)
dotnet ef migrations add InitialCreate

# Apply to database
dotnet ef database update
```

**What migrations do**:
- Track database schema changes in code
- Version control for database structure
- Can roll back or apply changes to any environment

---

## ⚛️ Frontend (Next.js)

### Project Structure
```
frontend/src/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── reservations/
│       ├── page.tsx                  # List view
│       ├── page.module.scss          # Styles
│       ├── [id]/
│       │   └── page.tsx              # Detail view (dynamic route)
│       └── new/
│           └── page.tsx              # Create form
├── components/
│   ├── Button/
│   ├── ReservationCard/
│   └── ReservationForm/
│       ├── ReservationForm.tsx
│       ├── ReservationForm.module.scss
│       └── index.tsx                 # Barrel export
└── lib/
    └── api.ts                        # API client functions
```

### Key Concepts

#### 1. **Next.js App Router** (Next.js 13+)
- File-based routing: `app/reservations/page.tsx` → `/reservations`
- **Dynamic routes**: `[id]/page.tsx` → `/reservations/123`
- **Server Components** by default (opt-in to client with `"use client"`)

#### 2. **lib/api.ts** - API Client Layer
```typescript
const API_URL = "http://localhost:5299/api/reservations";

export async function getReservations() {
  const res = await fetch(API_URL, {
    cache: "no-store",  // Always get fresh data
  });

  if (!res.ok) {
    throw new Error("Failed to fetch reservations");
  }

  return res.json();
}

export async function createReservation(data: {
  memberName: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create reservation");
  }

  return res.json();
}
```

**Interview Note**: Separating API logic from components improves maintainability and testability.

#### 3. **reservations/page.tsx** - List View with Client-Side Rendering
```tsx
"use client";  // Needed for useState, useEffect, useRouter

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReservations()
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);  // Empty deps = run once on mount

  // Click handler navigates to detail page
  const handleCardClick = (id: number) => {
    router.push(`/reservations/${id}`);
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>Reservations</h1>
        <Button onClick={() => router.push("/reservations/new")}>
          Add Reservation
        </Button>
      </div>

      <div className={styles.list}>
        {reservations.map((res) => (
          <div key={res.id} onClick={() => handleCardClick(res.id)}>
            <ReservationCard reservation={res} />
          </div>
        ))}
      </div>
    </main>
  );
}
```

#### 4. **Dynamic Route with React.use()** (Next.js 15+ Breaking Change)
```tsx
import { use } from "react";

// In Next.js 15+, params is a Promise!
export default function ReservationDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Must unwrap with React.use()
  const { id } = use(params);

  useEffect(() => {
    fetch(`http://localhost:5299/api/reservations/${id}`)
      .then(res => res.json())
      .then(setReservation);
  }, [id]);

  // Rest of component...
}
```

**Interview Note**: This is a **breaking change** in Next.js 15+. Previously `params` was a plain object.

#### 5. **ReservationForm.tsx** - Controlled Form Component
```tsx
export default function ReservationForm({ onSubmit }: ReservationFormProps) {
  const [form, setForm] = useState({
    memberName: "",
    destination: "",
    startDate: "",
    endDate: "",
    status: "pending",
  });

  // Type-safe event handler
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);  // Pass data up to parent
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="memberName">Member Name</label>
        <input
          id="memberName"
          name="memberName"
          value={form.memberName}
          onChange={handleChange}
          required
        />
      </div>
      {/* More fields... */}
      <Button type="submit">Save</Button>
    </form>
  );
}
```

**Interview Notes**:
- **Controlled components**: React state is the "single source of truth"
- **htmlFor attribute**: Associates label with input for accessibility
- **Spread operator**: `{ ...form, [name]: value }` preserves other fields

#### 6. **SCSS Modules** - Scoped Styling
```scss
// ReservationCard.module.scss
.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.status {
  &.pending { color: #f59e0b; }
  &.confirmed { color: #10b981; }
  &.cancelled { color: #ef4444; }
}
```

**Import in component**:
```tsx
import styles from './ReservationCard.module.scss';

<div className={styles.card}>
  <span className={`${styles.status} ${styles.pending}`}>
```

**Interview Note**: Modules scope CSS to component, preventing global conflicts.

---

## 🔄 How They Communicate

### CORS (Cross-Origin Resource Sharing)

**The Problem**: Browser security blocks requests from `localhost:3000` to `localhost:5299` (different origins).

**The Solution**: Backend explicitly allows frontend's origin
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:3000")  // Frontend URL
              .AllowAnyHeader()   // Allow all headers
              .AllowAnyMethod();  // Allow GET, POST, PUT, DELETE
    });
});

app.UseCors("AllowFrontend");  // Activate the policy
```

**Interview Note**: In production, replace `localhost:3000` with actual frontend domain.

### HTTP Request/Response Cycle

```
Frontend                        Backend
--------                        -------
1. User clicks "Save"
2. createReservation() called
3. fetch() sends HTTP POST
   {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: '{"memberName":"John","destination":"Paris",...}'
   }
                    ────────────────────────────────→
                                4. ASP.NET receives request
                                5. Model binding creates Reservation object
                                6. ReservationsController.CreateReservation()
                                7. EF Core adds to context
                                8. SaveChangesAsync() generates SQL INSERT
                                9. SQL Server stores data
                                10. Response: 201 Created + JSON
                    ←────────────────────────────────
11. Promise resolves
12. Navigate to /reservations
13. List refreshes
```

---

## 💾 Database Setup

### Connection String
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ReservationsDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Components**:
- `Server=localhost` - SQL Server instance
- `Database=ReservationsDb` - Database name
- `Trusted_Connection=True` - Use Windows authentication
- `TrustServerCertificate=True` - Accept self-signed certificates

### Entity Framework Commands
```bash
# Install EF Core CLI tools
dotnet tool install --global dotnet-ef

# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# View generated SQL (without applying)
dotnet ef migrations script
```

---

## 🐛 Bugs Fixed

### Backend Issues

#### 1. **Missing CORS Middleware Activation**
**Problem**: CORS policy was defined but never activated with `app.UseCors()`.

**Symptom**: 
```
Access to fetch at 'http://localhost:5299/api/reservations' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Fix**: Added `app.UseCors("AllowFrontend");` in `Program.cs`

**Why it matters**: Without CORS, browsers block cross-origin requests for security.

#### 2. **Controller in Wrong Location**
**Problem**: `ReservationsController.cs` was in `backend/Controllers/` instead of `backend/ReservationApi/Controllers/`.

**Symptom**: Controller not found, routes not working.

**Fix**: Moved controller to correct project directory.

**Why it matters**: ASP.NET only discovers controllers within the project folder.

---

### Frontend Issues

#### 3. **Missing ReservationForm/index.tsx**
**Problem**: TypeScript couldn't resolve `import ReservationForm from "@/components/ReservationForm"`.

**Symptom**: 
```
File 'c:/dev/crash-project/frontend/src/components/ReservationForm/index.tsx' not found.
```

**Fix**: Created barrel export file:
```tsx
// index.tsx
export { default } from './ReservationForm';
```

**Why it matters**: Barrel exports allow cleaner imports without specifying the component file name.

#### 4. **Empty [id]/page.tsx**
**Problem**: Dynamic route page was completely empty.

**Symptom**: Blank page when viewing individual reservations.

**Fix**: Implemented complete detail view with:
- Fetch reservation by ID
- Display all fields
- Delete functionality
- Back navigation

#### 5. **Incomplete API Integration**
**Problem**: `api.ts` only had `getReservations()`, missing create/update/delete.

**Fix**: Added all CRUD operations:
```typescript
export async function createReservation(data) { /* ... */ }
export async function updateReservation(id, data) { /* ... */ }
export async function deleteReservation(id) { /* ... */ }
```

#### 6. **Non-Functional New Reservation Page**
**Problem**: Form submission only logged to console instead of calling API.

**Fix**: Implemented actual API call:
```tsx
async function handleCreate(data) {
  try {
    await createReservation(data);
    router.push("/reservations");  // Navigate after success
  } catch (error) {
    alert("Failed to create reservation");
  }
}
```

#### 7. **Button Component Missing Form Support**
**Problem**: Button component didn't support `type="submit"`.

**Symptom**: 
```
Property 'type' does not exist on type 'IntrinsicAttributes & 
{ children: ReactNode; onClick: () => void; }'
```

**Fix**: Updated Button interface:
```tsx
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;       // Made optional
  type?: 'button' | 'submit' | 'reset';  // Added type prop
}
```

#### 8. **TypeScript Errors in Form Handler**
**Problem**: Event handlers had implicit `any` type.

**Symptom**: 
```
Parameter 'e' implicitly has an 'any' type.
```

**Fix**: Added proper types:
```tsx
function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
  // ...
}

function handleSubmit(e: React.FormEvent) {
  // ...
}
```

#### 9. **Form Labels Missing Accessibility**
**Problem**: Labels not associated with inputs.

**Symptom**: Screen readers couldn't announce field purposes.

**Fix**: Added `htmlFor` and `id` attributes:
```tsx
<label htmlFor="memberName">Member Name</label>
<input id="memberName" name="memberName" />
```

#### 10. **Inline Styles (Linting Violations)**
**Problem**: Using `style={{ display: "flex" }}` instead of CSS classes.

**Fix**: Created CSS classes in SCSS modules:
```scss
.buttonGroup {
  display: flex;
  gap: 1rem;
}

.clickable {
  cursor: pointer;
}
```

#### 11. **Port Mismatch**
**Problem**: Frontend called `localhost:5001` but backend ran on `localhost:5299`.

**Symptom**: All API calls failed with network errors.

**Fix**: Updated all API URLs to `http://localhost:5299`.

**How to check**: Look at `launchSettings.json` for actual backend port.

#### 12. **Next.js 15+ Params Promise** (Critical for Next.js 15+)
**Problem**: Accessing `params.id` directly when `params` is now a Promise.

**Symptom**: 
```
A param property was accessed directly with `params.id`. 
`params` is a Promise and must be unwrapped with `React.use()`
```

**Fix**: Unwrap params with `React.use()`:
```tsx
import { use } from "react";

export default function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);  // Unwrap the Promise
  // Now use `id` instead of `params.id`
}
```

**Why the change**: Next.js 15+ made this change to support improved streaming and Suspense boundaries.

#### 13. **Missing tsconfig.json Option**
**Problem**: `forceConsistentCasingInFileNames` not enabled.

**Fix**: Added to `compilerOptions`:
```json
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true
  }
}
```

**Why it matters**: Prevents cross-OS issues (Windows is case-insensitive, Linux is case-sensitive).

---

## 🚀 Running the Project

### Prerequisites
- **SQL Server** (LocalDB or Express)
- **.NET 10 SDK**
- **Node.js 18+**

### Backend Setup
```bash
cd backend/ReservationApi

# Restore dependencies
dotnet restore

# Apply database migrations
dotnet ef database update

# Run the API (starts on http://localhost:5299)
dotnet run
```

**Verify**: Visit `http://localhost:5299/swagger` to see API docs.

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server (starts on http://localhost:3000)
npm run dev
```

**Verify**: Visit `http://localhost:3000` to see the home page.

### Testing the Full Stack
1. Navigate to `http://localhost:3000/reservations`
2. Click "Add Reservation"
3. Fill out the form and submit
4. Verify reservation appears in list
5. Click a reservation to view details
6. Test delete functionality

---

## 🎯 Interview Key Points

### Architecture & Design Patterns

1. **Separation of Concerns**
   - Backend: Controllers (HTTP) → Services (business logic) → Repositories (data access)
   - Frontend: Pages → Components → API client

2. **RESTful API Design**
   - Resources as nouns: `/api/reservations`
   - HTTP verbs for actions: GET, POST, PUT, DELETE
   - Proper status codes: 200, 201, 204, 404, 400, 500

3. **Dependency Injection** (Backend)
   - Register services in `Program.cs` with `builder.Services.Add...()`
   - Constructor injection in controllers
   - Benefits: Testability, loose coupling, lifetime management

4. **Component Composition** (Frontend)
   - Small, reusable components
   - Props for data down, callbacks for events up
   - Separation of presentational vs. container components

### C# / .NET Concepts

1. **Async/Await**
   ```csharp
   public async Task<IActionResult> GetReservations()
   {
       // Frees thread while waiting for I/O
       return Ok(await _context.Reservations.ToListAsync());
   }
   ```
   - Prevents blocking threads during database/network operations
   - Improves scalability

2. **Entity Framework Core**
   - **DbContext**: Unit of work + repository pattern
   - **DbSet**: Collection of entities (table)
   - **Migrations**: Version control for database schema
   - **Change Tracking**: EF tracks entity modifications automatically

3. **Model Binding**
   ```csharp
   public async Task<IActionResult> CreateReservation(Reservation reservation)
   ```
   - ASP.NET automatically deserializes JSON request body to C# object
   - Validates data annotations

4. **Middleware Pipeline**
   ```
   Request → CORS → Routing → EndpointMiddleware → Response
   ```
   - Order matters!
   - Each middleware can short-circuit the pipeline

### React / Next.js Concepts

1. **Server vs. Client Components** (Next.js 13+)
   - **Server**: Default, runs on server, can't use hooks/events
   - **Client**: `"use client"`, runs in browser, can use useState/useEffect
   - When to use client: Interactive UI, browser APIs, React hooks

2. **React Hooks**
   - `useState`: Local state management
   - `useEffect`: Side effects (data fetching, subscriptions)
   - `useRouter`: Navigation (Next.js)
   - **use** (React 19): Unwrap promises/context

3. **Controlled Components**
   ```tsx
   const [value, setValue] = useState("");
   <input value={value} onChange={(e) => setValue(e.target.value)} />
   ```
   - React state is single source of truth
   - Enables validation, formatting, conditional rendering

4. **TypeScript Benefits**
   - Compile-time type checking
   - IntelliSense/autocomplete
   - Self-documenting interfaces
   - Refactoring safety

### Common Interview Questions

**Q: How does CORS work?**
A: Browser sends preflight OPTIONS request. Server responds with `Access-Control-Allow-Origin` header. If allowed, browser sends actual request.

**Q: Why async/await instead of .then()?**
A: More readable, easier error handling with try/catch, behaves like synchronous code.

**Q: What's the difference between PUT and POST?**
A: POST creates new resources (non-idempotent). PUT updates existing resources (idempotent - calling multiple times has same effect).

**Q: How does Entity Framework know what to save?**
A: Change tracking. When you call `.Add()`, `.Update()`, or modify a tracked entity, EF marks it as added/modified. `SaveChangesAsync()` generates appropriate SQL.

**Q: Why use CSS Modules instead of global CSS?**
A: Scoped styles prevent naming conflicts, enable component-level styles, improve maintainability.

**Q: What's the benefit of the App Router over Pages Router?**
A: Server components by default (better performance), layouts, loading/error states, streaming, better data fetching.

**Q: How do you handle errors in async operations?**
A: 
- Backend: Try-catch blocks, return appropriate status codes
- Frontend: Try-catch, .catch() on promises, error boundaries for React

**Q: What security concerns should you consider?**
A: 
- **CSRF**: Use anti-forgery tokens
- **XSS**: Sanitize user input, React escapes by default
- **SQL Injection**: Use parameterized queries (EF Core does this)
- **CORS**: Restrict allowed origins in production
- **Authentication**: Add JWT/OAuth for production APIs

---

## 📚 Further Learning

### Backend
- **Authentication**: Implement JWT tokens or Identity
- **Validation**: Add FluentValidation or Data Annotations
- **Logging**: Integrate Serilog
- **Caching**: Add Redis for performance
- **API Versioning**: Support multiple API versions

### Frontend
- **State Management**: Add Zustand or Redux for global state
- **Server Actions**: Use Next.js server actions for mutations
- **Optimistic UI**: Update UI before API response
- **Error Boundaries**: Catch React errors gracefully
- **Testing**: Add Jest + React Testing Library

### DevOps
- **Docker**: Containerize both apps
- **CI/CD**: GitHub Actions for automated testing/deployment
- **Azure**: Deploy API to Azure App Service, frontend to Vercel

---

## 🎓 Summary

This project demonstrates:
- ✅ Full-stack development with modern technologies
- ✅ RESTful API design and implementation
- ✅ Entity Framework Core and database migrations
- ✅ React component architecture and hooks
- ✅ Next.js App Router and dynamic routes
- ✅ TypeScript for type safety
- ✅ CORS configuration for cross-origin requests
- ✅ Debugging and fixing real-world issues
- ✅ Proper separation of concerns and clean code

**Key Takeaway for Interviews**: Understanding how data flows from user interaction → React component → API call → backend controller → database and back is crucial. Being able to explain this end-to-end flow demonstrates full-stack competency.

---

## 📞 Project Metadata
- **Created**: 2026
- **Stack**: .NET 10 + Next.js 16
- **Purpose**: Learning & demonstration
- **License**: MIT

Good luck with your interview! 🚀
