Below is a **build-ready PRD** you can give directly to Antigravity. I’ve kept the AI requirement explicit but **not invented an AI feature you rejected**; the application architecture should leave a clean integration point for AI later.

# College Event Management System

## Product Requirements Document (PRD)

**Version:** 1.0
**Status:** MVP Development
**Target:** College-only event management platform

---

# 1. Product Overview

Build a modern web application for managing college events.

The platform connects three types of users:

1. **Students** — discover and register for approved college events.
2. **Organizers** — create and manage their own events and view registration details.
3. **Admin** — reviews and approves/rejects events and monitors overall event activity.

The primary objective is to replace fragmented event-registration workflows with one centralized college platform.

The application should be responsive, modern, simple to use, and production-oriented.

---

# 2. Core Product Workflow

```text
Organizer
   ↓
Creates Event
   ↓
Event Status = PENDING
   ↓
Admin Reviews
   ↓
 ┌───────────────┐
 │               │
Approve        Reject
 │               │
 ↓               ↓
PUBLISHED      REJECTED
 │
 ↓
Students discover event
 │
 ↓
Student registers
 │
 ↓
Registration stored
 │
 ↓
Organizer views registrations
```

Only **approved/published events** should be visible to normal students.

---

# 3. User Roles

## 3.1 Student

Students can:

* Create an account/login.
* Login using email/password.
* Login using Google.
* Browse approved events.
* Search events.
* Filter events.
* Sort events.
* View complete event details.
* Register for events.
* Unregister where permitted.
* View their registrations.
* View event registration history.
* Complete custom registration questions.
* Receive registration confirmation.

Students must NOT:

* Create events.
* Approve events.
* Access other users' registrations.
* Access organizer dashboards.
* Access admin dashboards.

---

# 4. Organizer

An organizer is an authenticated user who is allowed to conduct events.

Organizers can:

* Create events.
* Edit their own events.
* Submit events for admin approval.
* View their own events.
* View registration details for their own events.
* Close registration.
* Delete/cancel their own events where permitted.
* View event status.

Organizers must NOT:

* Approve their own events.
* View another organizer's private event data.
* Access admin functionality.
* Modify events after they have been approved without appropriate status handling.

### Organizer event visibility

Organizer dashboard should show:

```text
My Events

Event Name
Status
Date
Registrations
Registration Deadline
Actions
```

Possible statuses:

* Draft
* Pending Approval
* Approved
* Rejected
* Registration Closed
* Cancelled
* Completed

---

# 5. Admin

The admin is the highest-privilege role.

The admin account should be configured through secure environment variables rather than hardcoded into the source code.

Example:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-password
```

Do NOT expose these values in frontend code.

Admin capabilities:

* Login.
* View all events.
* Review pending events.
* Approve events.
* Reject events.
* Provide rejection reason.
* View all organizers.
* View all students.
* View registrations.
* View event statistics.
* View college-wide analytics.
* Cancel/remove inappropriate events.
* Monitor event activity.

---

# 6. Authentication

Use **Better Auth**.

Authentication methods:

### Email + Password

Users should be able to:

* Register.
* Login.
* Logout.
* Maintain authenticated sessions.

### Google Authentication

Users should be able to:

```text
Continue with Google
```

Google OAuth should be implemented through Better Auth.

Credentials and OAuth secrets must be stored only in environment variables.

Example:

```env
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MONGODB_URI=
```

Never expose secrets through client-side code.

---

# 7. Role-Based Access Control

Every protected route and server-side operation must verify authorization.

Example:

```text
/student/*
    → Student

/organizer/*
    → Organizer

/admin/*
    → Admin
```

Do NOT rely only on hiding UI elements.

Authorization must also be enforced on the server.

For example:

An organizer attempting:

```text
GET /api/events/{anotherOrganizerEvent}
```

must not receive unauthorized data.

---

# 8. Event Creation

Organizers should have a multi-section event creation form.

## Required fields

### Basic Information

* Event title
* Event description
* Event category
* Event poster/image

### Schedule

* Event date
* Start time
* End time
* Registration deadline

### Venue

* Venue name
* Optional venue details

### Participation

* Maximum participants
* Eligibility
* Prerequisites

### Contact

* Organizer/contact person
* Contact email
* Optional phone number

### Event Information

* Rules
* Agenda/schedule

### Custom Registration Questions

Organizer can create custom questions.

Examples:

```text
Department?
Year?
Team name?
Do you have prior experience with Python?
```

Supported question types should initially include:

* Short text
* Long text
* Single choice
* Multiple choice
* Yes/No

Organizer should be able to mark questions as:

```text
Required
Optional
```

---

# 9. Event Draft System

When an organizer begins creating an event, it should initially be:

```text
DRAFT
```

The organizer can save incomplete events.

When ready:

```text
Submit for Approval
```

The event becomes:

```text
PENDING
```

Students cannot see pending events.

---

# 10. Admin Approval Workflow

Admin dashboard should contain a dedicated section:

```text
Pending Event Approvals
```

Each event should display:

* Event title
* Organizer
* Description
* Date
* Venue
* Category
* Maximum participants
* Registration deadline
* Rules
* Prerequisites
* Custom registration questions

Admin actions:

```text
Approve
Reject
```

If rejected, admin should provide a rejection reason.

Example:

```text
Status: REJECTED

Reason:
Please provide a clearer eligibility section.
```

The organizer should be able to see the rejection reason.

---

# 11. Published Events

After admin approval:

```text
PENDING → APPROVED
```

The event becomes visible to students.

Students should never see:

* Draft events
* Pending events
* Rejected events

unless specifically exposed through an appropriate organizer/admin interface.

---

# 12. Student Event Discovery

The student-facing event page should provide:

### Search

Search by:

* Event title
* Description
* Category
* Organizer

### Filters

Filter by:

* Category
* Date
* Registration availability
* Event status

### Sorting

Sort by:

* Upcoming
* Recently added
* Registration deadline

The default view should prioritize upcoming approved events.

---

# 13. Event Details Page

Each published event should have a dedicated page.

Example structure:

```text
--------------------------------
EVENT POSTER
--------------------------------

Event Title

Category
Date
Time
Venue

Description

About the Event

Eligibility

Prerequisites

Agenda

Rules

Organizer Information

Registration Deadline

Seats Available

[ Register Now ]
--------------------------------
```

If registration is closed:

```text
Registration Closed
```

If the student has already registered:

```text
You are registered
```

---

# 14. Student Registration

When the student selects:

```text
Register Now
```

the system should:

1. Verify authentication.
2. Verify the event is approved.
3. Verify registration is still open.
4. Verify capacity has not been reached.
5. Display the organizer-defined custom questions.
6. Collect answers.
7. Create registration.
8. Show confirmation.

Prevent duplicate registration.

A student should only have one active registration for the same event.

---

# 15. Registration Data

Each registration should contain:

* Student ID
* Event ID
* Registration timestamp
* Custom question responses
* Registration status

Example:

```text
Registration
├── Student
├── Event
├── Registered At
├── Status
└── Responses
```

---

# 16. Student Dashboard

The student dashboard should contain:

### Upcoming Registrations

```text
My Upcoming Events
```

Each card should display:

* Event name
* Date
* Time
* Venue
* Organizer
* Registration status

### Registration History

Students should be able to view previous registrations.

Possible sections:

```text
Upcoming
Past
Cancelled
```

---

# 17. Organizer Dashboard

Organizer dashboard:

```text
Dashboard
│
├── Overview
│
├── My Events
│
├── Create Event
│
└── Profile
```

Overview should display:

* Total events
* Pending events
* Approved events
* Total registrations

### My Events

Table/card view:

```text
Event
Status
Date
Registrations
Deadline
Actions
```

Actions:

```text
View
Edit
Registrations
Close Registration
Cancel
```

Organizers should only see their own events.

---

# 18. Organizer Registration View

For every organizer-owned event:

```text
Event
↓
Registrations
```

Display:

* Student name
* Student email
* Registration date
* Answers to custom questions

Example:

```text
John Doe
john@college.edu
Registered: 28 Sept 2026

Department: Information Science
Year: 2nd
Team Name: Team Alpha
```

Organizer must not have access to registrations belonging to another organizer's event.

---

# 19. Admin Dashboard

The admin dashboard should provide college-wide visibility.

## Overview Cards

```text
Total Students
Total Organizers
Total Events
Pending Approvals
Approved Events
Total Registrations
```

## Analytics

Include:

### Event statistics

* Events created over time
* Approved vs rejected events
* Events by category

### Registration statistics

* Registrations over time
* Registrations per event
* Registrations by category

### Participation statistics

* Student participation
* Most active event categories
* Registration trends

Charts should be clean and easy to understand.

---

# 20. Admin Event Management

Admin should have:

```text
All Events
```

with:

* Search
* Filters
* Event status
* Organizer
* Date
* Category

Admin actions:

```text
View
Approve
Reject
Cancel
```

---

# 21. Database

Use **MongoDB with the native MongoDB driver**.

Do NOT introduce Mongoose unless explicitly required later.

Recommended collections:

```text
users
events
registrations
sessions
accounts
verifications
```

Better Auth-related collections should follow Better Auth's required database structure.

---

# 22. User Model

Conceptual structure:

```ts
User {
  _id
  name
  email
  image
  role
  createdAt
  updatedAt
}
```

Role:

```ts
"student" | "organizer" | "admin"
```

---

# 23. Event Model

Conceptual structure:

```ts
Event {
  _id

  title
  description

  category
  posterUrl

  date
  startTime
  endTime

  venue

  registrationDeadline
  maxParticipants

  eligibility
  prerequisites

  rules
  agenda

  contactName
  contactEmail
  contactPhone

  customQuestions[]

  organizerId

  status

  rejectionReason

  createdAt
  updatedAt
}
```

Possible status:

```ts
"DRAFT"
"PENDING"
"APPROVED"
"REJECTED"
"CLOSED"
"CANCELLED"
"COMPLETED"
```

---

# 24. Custom Question Model

Example:

```ts
CustomQuestion {
  id
  question
  type
  options[]
  required
}
```

Types:

```ts
"text"
"textarea"
"single-choice"
"multiple-choice"
"boolean"
```

---

# 25. Registration Model

Conceptual structure:

```ts
Registration {
  _id

  eventId
  studentId

  responses[]

  status

  registeredAt
  updatedAt
}
```

Responses:

```ts
{
  questionId,
  answer
}
```

Create a unique constraint/index for:

```text
eventId + studentId
```

to prevent duplicate registrations.

---

# 26. Important Database Indexes

Implement indexes for common queries.

Examples:

```text
events.status
events.organizerId
events.date
events.category
events.registrationDeadline

registrations.eventId
registrations.studentId

unique(events + student)
```

Optimize database queries rather than loading unnecessary documents.

---

# 27. API / Server Architecture

Use Next.js server-side functionality.

Keep database operations on the server.

Recommended conceptual separation:

```text
app/
components/
lib/
  auth/
  db/
  services/
  validations/
  permissions/
```

Example services:

```text
eventService
registrationService
adminService
userService
```

Business logic should not be duplicated across UI components.

---

# 28. Validation

Use strong server-side validation.

Recommended:

```text
Zod
```

Validate:

* Event creation
* Event updates
* Registration
* Custom questions
* Admin actions
* Authentication-related input

Never trust client-side validation alone.

---

# 29. UI / Design System

Use:

* **Next.js**
* **shadcn/ui**
* Tailwind CSS
* Responsive design

The UI should feel like a modern SaaS product.

Design principles:

* Clean
* Minimal
* Professional
* Accessible
* Responsive
* Consistent spacing
* Clear hierarchy

Avoid unnecessary visual complexity.

---

# 30. Main Pages

## Public

```text
/
 /events
 /events/[id]
 /login
 /register
```

## Student

```text
/dashboard
/dashboard/events
/dashboard/registrations
/dashboard/profile
```

## Organizer

```text
/organizer
/organizer/events
/organizer/events/create
/organizer/events/[id]
/organizer/events/[id]/edit
/organizer/events/[id]/registrations
```

## Admin

```text
/admin
/admin/events
/admin/events/pending
/admin/events/[id]
/admin/organizers
/admin/students
/admin/analytics
```

---

# 31. Route Protection

Protected routes must verify:

1. User is authenticated.
2. User has required role.
3. User owns the resource where applicable.

Examples:

```text
Student → /dashboard
Organizer → /organizer/*
Admin → /admin/*
```

For organizer event access:

```text
event.organizerId === currentUser.id
```

must be checked server-side.

---

# 32. Event State Machine

Implement event lifecycle carefully.

```text
DRAFT
  │
  │ Submit
  ↓
PENDING
  │
  ├── Approve ──→ APPROVED
  │
  └── Reject ───→ REJECTED

APPROVED
  │
  ├── Deadline reached → CLOSED
  │
  ├── Organizer closes → CLOSED
  │
  └── Admin/Organizer cancellation → CANCELLED

CLOSED
  ↓
COMPLETED
```

Prevent invalid state transitions.

---

# 33. Notifications

For the MVP, UI-based notifications can be implemented first.

Examples:

Organizer:

```text
Your event has been approved.
```

or:

```text
Your event has been rejected.

Reason:
Please update the event eligibility information.
```

Student:

```text
Registration successful.
```

Email notifications can be added as a subsequent feature.

---

# 34. AI Architecture Requirement

AI is a planned component of the product, but the exact AI feature should **not be fabricated during implementation**.

The codebase should therefore have a clean AI integration layer so AI capabilities can be added without restructuring the application.

Recommended:

```text
lib/
  ai/
    index.ts
    provider.ts
    prompts/
```

Use an abstraction such as:

```ts
interface AIProvider {
  generateText(input: string): Promise<string>
}
```

The initial MVP may keep this interface inactive until the AI functionality is finalized.

Do not add an arbitrary chatbot merely to claim that the application uses AI.

---

# 35. Security Requirements

Critical requirements:

### Never expose secrets

Do not place:

```text
MONGODB_URI
BETTER_AUTH_SECRET
GOOGLE_CLIENT_SECRET
ADMIN_PASSWORD
```

in client-side code.

### Authorization

Every sensitive operation must be checked server-side.

### Input validation

All user-generated data must be validated.

### XSS protection

Safely render user-generated event descriptions.

### MongoDB security

Use environment variables for connection strings.

### Authentication

Use Better Auth rather than manually implementing password/session management.

---

# 36. Admin Credentials

Admin credentials should be supplied through environment variables.

Example:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

The implementation must never commit these values to Git.

Provide:

```text
.env.example
```

with placeholders only:

```env
MONGODB_URI=
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

# 37. Environment Configuration

Create:

```text
.env.example
```

Document all required variables.

The application should fail gracefully with a clear server-side configuration error if required environment variables are missing.

---

# 38. Error Handling

Implement user-friendly error states.

Examples:

### Event not found

```text
Event not found.
```

### Unauthorized

```text
You don't have permission to access this page.
```

### Registration closed

```text
Registration for this event is closed.
```

### Event full

```text
This event has reached its participant limit.
```

### Duplicate registration

```text
You are already registered for this event.
```

Do not expose raw database errors to users.

---

# 39. Loading States

Use shadcn loading/skeleton patterns.

Important pages should have loading states:

* Event listing
* Event details
* Dashboard
* Registration
* Admin analytics
* Organizer event list

---

# 40. Empty States

Design meaningful empty states.

Example:

```text
No upcoming events

There are no approved events available right now.
```

Organizer:

```text
You haven't created any events yet.

[ Create Event ]
```

Admin:

```text
No pending events.
```

---

# 41. Responsive Design

The application must work on:

* Desktop
* Laptop
* Tablet
* Mobile

Priority:

```text
Desktop + mobile
```

Tables should become responsive cards or horizontally scrollable layouts on smaller screens.

---

# 42. Accessibility

Use semantic HTML and accessible shadcn components.

Requirements:

* Keyboard navigation
* Proper labels
* Accessible form controls
* Sufficient contrast
* Focus states
* Screen-reader-friendly buttons
* Meaningful error messages

---

# 43. MVP Scope

The first implementation must prioritize:

### Authentication

* Better Auth
* Email/password
* Google OAuth
* Role-based access

### Student

* Browse events
* Search/filter
* Event details
* Registration
* Custom registration forms
* Registration dashboard

### Organizer

* Create event
* Save draft
* Submit for approval
* View own events
* Edit own events
* View registrations

### Admin

* Dashboard
* Pending approvals
* Approve/reject
* Rejection reason
* View all events
* Analytics

### Infrastructure

* MongoDB native driver
* Server-side authorization
* Validation
* Responsive UI
* Secure environment configuration

---

# 44. Features NOT Required in MVP

Do not implement these unless explicitly requested later:

* Payment gateway
* Razorpay
* Event ticket payments
* QR attendance
* Certificates
* Chat system
* Social feed
* External event organizations
* Multi-college support
* Complex recommendation engine
* Arbitrary AI chatbot
* Web3
* Blockchain
* Microservices

Keep the MVP focused.

---

# 45. Future AI Possibilities

The architecture should make these possible later:

```text
AI Event Assistant
AI Event Description Generator
AI Registration Form Generator
AI Event Recommendation
AI Admin Analytics
AI Feedback Summarization
AI Event Moderation
```

These should be treated as future product decisions rather than automatically implemented.

---

# 46. Future Features

Potential post-MVP roadmap:

### Phase 2

* QR attendance
* Email notifications
* Certificates
* Event reminders
* Organizer analytics

### Phase 3

* AI features
* Personalized discovery
* AI analytics
* Feedback analysis

### Phase 4

* Multi-college architecture
* Inter-college events
* External organizers
* Payment support

---

# 47. Acceptance Criteria

The MVP is considered functional when:

### Authentication

* [ ] User can register using email/password.
* [ ] User can login using email/password.
* [ ] User can login using Google.
* [ ] User can logout.
* [ ] Sessions persist correctly.
* [ ] Roles are enforced server-side.

### Student

* [ ] Student can view approved events.
* [ ] Student can search events.
* [ ] Student can filter events.
* [ ] Student can view event details.
* [ ] Student can register.
* [ ] Student can answer custom registration questions.
* [ ] Duplicate registration is prevented.
* [ ] Student can view their registrations.

### Organizer

* [ ] Organizer can create an event.
* [ ] Organizer can save a draft.
* [ ] Organizer can submit an event.
* [ ] Event enters pending status.
* [ ] Organizer can view only their events.
* [ ] Organizer can edit appropriate events.
* [ ] Organizer can view registrations for their events.
* [ ] Organizer cannot access another organizer's event data.

### Admin

* [ ] Admin can login.
* [ ] Admin can view pending events.
* [ ] Admin can approve events.
* [ ] Admin can reject events.
* [ ] Admin can provide rejection reason.
* [ ] Admin can view all events.
* [ ] Admin can view analytics.
* [ ] Admin can view student/organizer information where permitted.

### Security

* [ ] Secrets are stored in environment variables.
* [ ] No credentials are committed to Git.
* [ ] Server-side authorization is implemented.
* [ ] Inputs are validated.
* [ ] Unauthorized resource access is blocked.

---

# 48. Recommended Project Structure

```text
src/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── events/
│   │   └── [id]/
│   │
│   ├── dashboard/
│   │
│   ├── organizer/
│   │   ├── events/
│   │   ├── create/
│   │   └── ...
│   │
│   ├── admin/
│   │   ├── events/
│   │   ├── analytics/
│   │   └── ...
│   │
│   └── api/
│
├── components/
│   ├── ui/
│   ├── events/
│   ├── dashboard/
│   ├── organizer/
│   └── admin/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── services/
│   ├── validations/
│   ├── permissions/
│   └── ai/
│
├── types/
│
└── ...
```

---

# 49. Development Principles

Antigravity should follow these principles:

1. **Build the MVP before adding optional features.**
2. Use the **MongoDB native driver**, not Mongoose.
3. Use **Better Auth** for authentication.
4. Use **shadcn/ui** for reusable UI components.
5. Keep business logic on the server.
6. Enforce authorization server-side.
7. Keep components modular.
8. Avoid duplicated business logic.
9. Use TypeScript throughout.
10. Use proper error/loading/empty states.
11. Keep the application responsive.
12. Never hardcode secrets.
13. Keep the AI integration modular and wait for the final AI feature specification.
14. Do not add unnecessary technologies or services.

---

# 50. Final Product Vision

The final system should provide one centralized platform where:

```text
                 COLLEGE
                    │
                  ADMIN
                    │
          ┌─────────┴─────────┐
          │                   │
       ORGANIZERS          STUDENTS
          │                   │
     Create Events       Discover Events
          │                   │
          ↓                   ↓
    Admin Approval       Register
          │                   │
          └─────────┬─────────┘
                    ↓
             EVENT ECOSYSTEM
```

The platform should make event management **organized, permission-controlled, searchable, and measurable**, while keeping the first version simple enough to build and deploy reliably.

**Primary technology stack:**

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Better Auth
MongoDB Native Driver
Zod
```

Build the application as a modular monolith initially. Do not introduce unnecessary microservices or infrastructure.
