# Product Specification Document (PRD) 
## Sistem Informasi Manajemen Sarana dan Prasarana (SIM-SAPRAS)

> **Document Type:** Comprehensive System Analysis & Specification
> **Target Audience:** Developers, QA (TestSprite), Project Managers
> **System Status:** Active Development (Beta)
> **Framework:** Next.js 15 (Frontend) + NestJS (Backend)

---

## 1. Executive Summary & Product Purpose
SIM-SAPRAS is a specialized Enterprise Resource Planning (ERP) web application designed to digitize the infrastructure management of a vocational school. It moves the organization away from fragmented spreadsheets and manual logbooks into a centralized, data-driven environment.

**Core Philosophy:**
The system is built around transparency and accountability. Every asset movement, every stock usage, and every procurement request is logged, traceable to a specific user, and validated against strict business rules.

**Primary Objectives:**
1.  **Asset Lifecycle Tracking**: From acquisition (Procurement) -> Inventory (Asset/Stock) -> Usage (Lending) -> Maintenance -> Disposal (Deletion).
2.  **Audit Readiness**: The system is designed to support "Stock Opname" (Physical Audit) at any time with mobile-friendly features.
3.  **Role-Based Security**: Strict segregation of duties between Administrators, Operational Staff, and End Users.

---

## 2. User Roles & Access Control Analysis
Based on the codebase analysis (`auth.guard.ts` and `roles.guard.ts`), the system enforces a strict 3-tier role hierarchy.

### 2.1 ADMIN (The Controller)
*   **Persona:** Vice Principal of Facilities (Wakasek Sarpras).
*   **System Authority:** `Level 1` (Highest).
*   **Key Capabilities:**
    *   **Final Approval:** Has the sole authority to `APPROVE` or `REJECT` procurement proposals that require budget.
    *   **User Management:** Can approve new account registrations and reset passwords for any user.
    *   **Data Override:** Can force-edit asset details or delete master data (Rooms, Categories) that are locked for others.
    *   **Configuration:** Manages active Academic Years (`2024/2025`, etc.) which segments data for reporting.

### 2.2 STAFF (The Operator)
*   **Persona:** Laboratory Technicians, Toolmen, Warehouse Staff.
*   **System Authority:** `Level 2` (Operational).
*   **Key Capabilities:**
    *   **Inventory Input:** Responsible for the daily data entry of new Assets and Stock items.
    *   **Transaction Execution:** Physically hands out items and records `Lending` (Borrowing) or `Stock OUT` transactions.
    *   **Audit Execution:** Performs the physical scanning of QR codes during Stock Opname.
    *   **Restrictions:** Cannot Approve procurements. Cannot Delete Users. Cannot change System Settings.

### 2.3 USER (The Requester)
*   **Persona:** Teachers (Guru), Department Heads (Kaprog), General Employees.
*   **System Authority:** `Level 3` (Self-Service).
*   **Key Capabilities:**
    *   **Request Initiation:** Can create "Procurement Proposals" for tools or supplies needed for their classes.
    *   **View Only Access:** Can search the Asset catalog to see what is available (e.g., "Is the projector in Lab 1 available?").
    *   **Reporting:** Can report broken items (`Service` requests).
    *   **Nuance:** Some Users (like Department Heads) may have an intermediate review status in the code, but functionally they fall under the "User" category who "Requests" rather than "Manages".

---

## 3. Detailed Feature Analysis & Mechanics

### 3.1 Authentication & Security Module
**Current Implementation:**
The system uses a stateless JWT (JSON Web Token) architecture.

1.  **Registration Flow:**
    *   User signs up -> Data saved with `isApproved: false`.
    *   **Analysis:** This prevents unauthorized access even if someone knows the registration URL. Admin must manually toggle `isApproved` in the dashboard.
2.  **Login Flow:**
    *   Input: Username/Email + Password.
    *   Logic: Validate credentials -> Check `isApproved` -> Issue JWT (Time-to-live: 24h).
3.  **Password Reset Flow (Secure):**
    *   **Trigger:** "Forgot Password" link on login.
    *   **Mechanism:**
        *   User inputs Email.
        *   Backend checks validity (silently returns success to prevent enumeration).
        *   Generates `32-byte` Hex Token -> Saves to DB (1 hour expiry).
        *   Sends Email via SMTP (Gmail) with link.
    *   **Reset:** User inputs New Password -> Backend validates complexity (Min 8 chars, Alphanumeric) -> Updates User -> Invalidates Token.
    *   **Validation:** Prevents reuse of the exact same password.

### 3.2 Asset Management (Inventaris)
**Purpose:** Managing "Fixed Assets" (Aset Tetap) like Computers, Tables, Machines.

*   **Database Structure:** `Asset` table linked to `Room`.
*   **Key Fields:**
    *   `Code`: Unique identifier (e.g., `LPT-LAB1-001`). Used for Barcodes.
    *   `Condition`: `GOOD`, `BROKEN_LIGHT`, `BROKEN_HEAVY`. Critical for audit.
    *   `PurchaseDate`: Determines asset age.
*   **Mechanics:**
    *   **Creation:** Staff inputs data. Code is auto-generated or manually overrides.
    *   **Room Assignment:** Every asset MUST belong to a `Room` or `Location`. This is vital for the "Audit per Room" feature.
    *   **Photos:** Assets support image upload (stored in `public/uploads` or cloud storage).

### 3.3 Stock Management (Habis Pakai)
**Purpose:** Managing "Consumables" (BHP) like Markers, Paper, Chemicals.

*   **Logic:** FIFO (First-In, First-Out) conceptual model, though tracked by aggregate quantity.
*   **Transaction Types:**
    *   `IN`: Increases `StockItem.quantity`. Source: Purchase.
    *   `OUT`: Decreases `StockItem.quantity`. Source: Usage.
*   **Validation Rule (`stock.service.ts`):**
    *   Transaction `OUT` will **fail (throw Error)** if `Request Quantity > Current Quantity`. Code: `if (item.quantity < qty) throw BadRequest`.
*   **Alerts:**
    *   Dynamic calculation: `IsLowStock = Current < MinStock`. Displays visually in frontend.

### 3.4 Procurement Workflow (Pengadaan)
**Purpose:** Structured requesting of new items to prevent budget misuse.

**The Workflow Mechanics:**
1.  **Drafting (User):**
    *   User creates a "Proposal".
    *   Adds multiple items (Name, Est. Price, Qty).
    *   Code sets status to `PENDING`.
2.  **Review (Admin/System):**
    *   Admin views the list of `PENDING` requests.
    *   Admin can filter by Priority (`HIGH`, `NORMAL`, `LOW`).
3.  **Decision (Admin):**
    *   **Action: APPROVE** -> Status updates to `APPROVED`. System logs the approval timestamp.
    *   **Action: REJECT** -> Admin must provide a `String` reason. Status updates to `REJECTED`.
    *   **Notification:** Backend triggers `MailService` to email the Requester immediately upon decision.

### 3.5 Lending System (Peminjaman)
**Purpose:** Accountability for shared usage assets.

*   **Workflow:**
    *   **Check-Out:** Staff selects Asset -> Selects User (Borrower). Logic ensures Asset is not already borrowed.
    *   **Check-In (Return):** Staff marks item as returned.
    *   **Condition Check:** If item went out `GOOD` and came back `BROKEN`, the system prompts to update the global Asset Condition.

### 3.6 Audit (Stock Opname)
**Purpose:** Yearly or Semesterly verification.

*   **Mechanism:**
    *   "Audit Session" is created for a Room.
    *   System snapshots the "Expected Assets" list.
    *   Staff walks the room -> Scans/Checklists items found.
    *   **Result:**
        *   `MATCH`: Database = Physical.
        *   `MISSING`: In DB but not in Room.
        *   `MOVED`: Found in Room but DB says it's elsewhere.

---

## 4. Technical Specifications & Validation Rules

### 4.1 Frontend Architecture (Next.js)
*   **Route Protection:** Middleware checks JWT existence.
*   **Role Guard:** Components (like "Delete Button") are conditionally rendered:
    ```tsx
    {user.role === 'ADMIN' && <DeleteButton />}
    ```
*   **State Management:** React Context (`AuthContext`) holds user session. Data fetching via SWR or Server Actions.

### 4.2 Backend Architecture (NestJS)
*   **Controllers:** REST API endpoints organized by domain (`/assets`, `/procurement`, `/auth`).
*   **Services:** Contain the business logic (e.g., Check stock level before transaction).
*   **Guards:**
    *   `JwtAuthGuard`: Helper to verify token signature.
    *   `RolesGuard`: Helper to verify `user.role` against `@Roles('ADMIN')` decorator.

### 4.3 Database Schema Integrity (Prisma)
1.  **Unique Constraints:**
    *   `User.email`, `User.username`
    *   `Asset.code`
2.  **Referential Integrity:**
    *   Cannot delete a `User` if they have `Procurement` records (Restrict/SetNull logic).
    *   Cannot delete a `Room` if it contains `Assets`.

---

## 5. API Endpoints Map (Core)

| Method | Endpoint | Role Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Authenticates user |
| POST | `/auth/reset-password` | Public | Finalizes reset |
| GET | `/assets` | All | List assets (filtered) |
| POST | `/assets` | Admin, Staff | Create new asset |
| GET | `/procurement` | User (Own), Admin (All) | List requests |
| PATCH | `/procurement/:id/approve` | Admin | Approve request |
| POST | `/stock/transaction` | Admin, Staff | Record IN/OUT |

---

## 6. Success Criteria
For a successful deployment (and TestSprite Result):
1.  **Zero-Trust Validation:** Backend must reject a non-Admin trying to hit `/approve` endpoint, even if they bypass the frontend UI.
2.  **Data Consistency:** Stock counts must never be negative.
3.  **Audit Trail:** Every status change in Procurement must have a timestamp.

---
**End of Specification**
**Generated for Project:** Sisapras-Sekolah
**Analysis By:** Antigravity AI

