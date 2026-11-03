# After Commerce — Full System & Architecture Specification

> **Notice for AI Models & Developers**: This document contains the single source of truth for the After Commerce codebase architecture across both the **Next.js frontend** (`aftercommerceweb/`) and the **Node.js/Express backend** (`lmsapi/`). Keep this file updated whenever adding or modifying models, routes, or pages.

---

## 1. Project High-Level Overview

* **Application**: After Commerce — An ecosystem for high-performance financial engineering, chartered commerce, and professional career acceleration.
* **Frontend (`aftercommerceweb`)**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Axios.
* **Backend (`lmsapi`)**: Node.js, Express 4, MongoDB (Mongoose), JWT, Redis (Token blacklisting/session invalidation), Nodemailer, Cloudflare R2 (Storage).
* **Communication Port Defaults**:
  - Frontend: `http://localhost:3000`
  - Backend: `http://localhost:5001` (configured via `NEXT_PUBLIC_BACKEND_URL`)

---

## 2. Backend Models Reference (`lmsapi/models/`)

Every model in `lmsapi/models/` and its schema purpose:

| Model File | Collection / Entity | Key Fields & Purpose |
| :--- | :--- | :--- |
| `User.js` | `User` | User profiles across roles (`student`, `admin`, `staff`, `influencer`). Includes `name`, `email`, `password` (hashed with bcrypt), `phone` (sparse unique), `role`, `is_onboarded`, `avatar_doc_id`, `permissions`, and `influencer_profile`. |
| `Course.js` | `Course` | Primary course catalog. Title, slug, description, category ID, thumbnail, pricing (regular, sale), difficulty, learning outcomes, status (`draft`, `published`, `archived`), author/staff references. |
| `Module.js` | `Module` | Chapters/sections inside a course. References `course_id`, order index, title, description. |
| `LearningUnit.js` | `LearningUnit` | Individual lessons inside modules. Unit types: `video`, `article`, `quiz`, `assignment`. Video URLs, document attachments, durations, pass criteria. |
| `Category.js` | `Category` | Taxonomy classification for courses. Name, slug, icon, description, order. |
| `Enrollment.js` | `Enrollment` | Links `user_id` to `course_id`. Tracks enrolled date, completion percentage, active status, and completed units. |
| `Order.js` | `Order` | Financial purchase transactions for course enrollments. Order numbers, user reference, course items, amount, payment gateways, status (`pending`, `completed`, `failed`). |
| `AssessmentTemplate.js` | `AssessmentTemplate` | Assessment & exam schemas. Exam titles, duration, passing score, question pool references. |
| `TemplateField.js` | `TemplateField` | Dynamic form field definitions for flexible assessments and surveys. |
| `StudentAttempt.js` | `StudentAttempt` | Student submissions on assessments. Score, started at, submitted at, attempt status. |
| `StudentAnswer.js` | `StudentAnswer` | Granular student question responses evaluated against answer keys. |
| `UserKycData.js` | `UserKycData` | Verification documents and compliance data for staff, instructors, and affiliates. |
| `Certificate.js` | `Certificate` | Issued course completion credentials with unique serial IDs and verification URLs. |
| `CertificateTemplate.js`| `CertificateTemplate` | Visual badge and PDF design templates for certificate generation. |
| `Document.js` | `Document` | Uploaded assets (images, PDFs, spreadsheets) backed by Cloudflare R2. URL, mime type, size, bucket path. |
| `CourseDiscussion.js` | `CourseDiscussion` | Forum threads and Q&A interactions per course unit. |
| `Testimonial.js` | `Testimonial` | Student reviews, star ratings, and mentor highlights. |
| `WalletTransaction.js` | `WalletTransaction` | Ledger entries for affiliate/influencer earnings and referral balances. |
| `WithdrawalRequest.js` | `WithdrawalRequest` | Payout requests initiated by affiliates or instructors to their bank accounts. |
| `OnboardingField.js` | `OnboardingField` | Dynamic configurable questions presented during new user or mentor onboarding. |

---

## 3. Backend REST API Endpoints (`lmsapi/routes/`)

### Authentication & Student Onboarding (`/api/auth`)
* `POST /api/auth/register`:
  - **Access**: Public
  - **Payload**: `{ name, email, password, phone? }`
  - **Behavior**: Validates email format, checks for duplicates, hashes password with bcrypt (salt rounds = 10), creates user with `role: 'student'`, generates 7-day JWT token (`{ id, role }`), returns `{ success: true, token, user }`.
* `POST /api/auth/login`:
  - **Access**: Public
  - **Payload**: `{ email, password }`
  - **Behavior**: Validates credentials via bcrypt compare, issues JWT token, strips password from response.
* `GET /api/auth/me`:
  - **Access**: Private (`verifyToken` middleware)
  - **Behavior**: Returns current authenticated user profile decoded from `Bearer <token>`.

### Public Student Catalog Endpoints (`/api/public`)
* `GET /api/public/categories-with-courses`:
  - **Access**: Public
  - **Behavior**: Retrieves all active categories (`is_active: { $ne: false }`) along with the count of published courses (`is_published: true` or `status: 'published'`). Returns `{ success: true, data: [...] }`.
* `GET /api/public/courses`:
  - **Access**: Public
  - **Query Params**: `?categoryId=<id>`
  - **Behavior**: Retrieves published courses under a specific category or overall (`is_published: true` or `status: 'published'`), populated with category metadata. Returns `{ success: true, count, data: [...] }`. When none are published, cleanly returns `count: 0, data: []`.

### Admin Management (`/api/admin`)
* `POST /api/admin/login`: Admin 2FA first-stage login, sends OTP.
* `POST /api/admin/verify-2fa`: Validates 2FA code and issues elevated admin token.
* `GET /api/admin/dashboard`: Dashboard KPI statistics (revenue, students, active courses).
* `GET /api/admin/courses`: Course list with pagination and category filtering.
* `POST /api/admin/courses`: Course creation.
* `PUT /api/admin/courses/:id`: Course metadata updates.
* `GET /api/admin/categories`: Category taxonomy management.
* `GET /api/admin/kyc`: KYC compliance audits.
* `GET /api/admin/influencer`: Affiliate & influencer referral tracking.
* `GET /api/admin/assessments`: Assessment builder & grading templates.

---

## 4. Frontend Pages & Routing Structure (`aftercommerceweb/src/app/`)

| Page Route | File Path | Purpose & Key Features |
| :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | **Landing Page**: Floating liquid glass navbar with responsive width contraction. Handles dynamic authentication state: shows "GET STARTED" when logged out, and replaces it with only the student profile icon when logged in. Profile icon toggles a liquid glass dropdown menu (Dashboard, My Courses, and Log Out). Clicking Log Out displays a confirmation modal, clears tokens/cookies/session from client storage, and refreshes the page. Features an interactive 4-stage convergence canvas (`HeroSection`), `FeaturedProgram` banner with mentor spotlight, 3D perspective coverflow carousel (`FeaturedCourses`), and forward/reverse scroll animations. |
| `/onboarding` | `src/app/onboarding/page.tsx` | **Student Onboarding Portal**: 3-Phase guided flow with a static, non-movable top header (anchored `sticky top-0 z-50` with step indicator, `Skip for now`, stamp tracker, and profile badge). **Phase 1 (Authentication)**: Compact, ergonomic credentials card (`max-w-[450px]`, `p-6 sm:p-8`) with smooth capsule switcher (`rounded-full`) matching reference with active orange dot (`• Sign In` / `• Create Account`), clean input fields without icon clutter, `Show`/`Hide` password text toggle, obsidian button (`#1A1A2E`), and adjacent mascot showcase glass pedestal (`h-[390px]`, `max-w-[250px]`) displaying dynamic companion mascots (`register.png` for account creation, `login.png` for signing in) with a buttery-smooth 500ms `cubic-bezier(0.16,1,0.3,1)` cross-fade, scale, and subtle float morph transition (avoiding unmounting or flickers) with ambient flares, floor shadow, role badge, and guidance dialog. **Phase 2 (Destination Tickets)**: Boarding-pass tickets with perforated cutouts, faint watermarked `01` background, dotted trajectory path with compass rose, `• EXPEDITION MANIFEST • 2025` badge, headline with wavy cyan underline, rubber ink `CHOSEN` stamp upon selection, and Atlas companion guidance speech bubble (`{route} logged!`). Auto-skips if only 1 category exists. **Phase 3 (Curriculum)**: If no courses are launched, displays empty state (*"Sorry, there are no courses for you"* with return button); if 1 course is published, displays single-course direct clearance & checkout; if multiple courses exist, displays the 4-module isometric 3D expedition grid with custom vector isometric cubes (orange/green/navy faces, white vertices, planted flags, and faceted polyhedrons) matching reference UI. |
| `/admin-login` | `src/app/admin-login/page.tsx` | **Enterprise Admin Portal**: Restricted login screen supporting two-factor authentication (2FA) and first-time password setup for staff/administrators. |
| `/admin` | `src/app/(admin)/admin/page.tsx` | **Admin Dashboard Root**: Executive metrics, active enrollments, recent transactions, quick actions. |
| `/admin/courses` | `src/app/(admin)/admin/courses/page.tsx` | Course management table with status filtering, search, and action menus. |
| `/admin/courses/create` | `src/app/(admin)/admin/courses/create/page.tsx` | Multi-step course creation wizard (Shell, Modules, Units). |
| `/admin/courses/categories` | `src/app/(admin)/admin/courses/categories/page.tsx` | Category organization and hierarchy manager. |
| `/admin/assessment-templates` | `src/app/(admin)/admin/assessment-templates/page.tsx` | Interactive quiz & exam template builder. |
| `/admin/kyc` | `src/app/(admin)/admin/kyc/page.tsx` | Identity verification document review interface. |
| `/admin/affiliates` | `src/app/(admin)/admin/affiliates/page.tsx` | Affiliate partner roster, referral codes, and commission payouts. |
| `/admin/staff` | `src/app/(admin)/admin/staff/page.tsx` | Staff roster and role-based access control (RBAC) permissions. |
| `/admin/profile` | `src/app/(admin)/admin/profile/page.tsx` | Administrative profile settings and password update form. |

---

## 5. Middleware & Security Architecture

1. **Client & API Cookie Management**:
   - `admin_token`: Restricted admin session token checked in `middleware.ts` for `/admin/*` route guarding.
   - `student_token`: Standard student learner session token stored in cookies and `localStorage`.
2. **CORS Configuration**:
   - `lmsapi/server.js` permits incoming connections from `http://localhost:3000` with credential support.
3. **Password Security**:
   - Bcrypt hashing with 10 salt rounds prior to MongoDB storage.
   - Plaintext passwords are automatically stripped from API responses.
4. **Token Invalidation**:
   - Redis blacklist mechanism checks revoked tokens on every protected request.
