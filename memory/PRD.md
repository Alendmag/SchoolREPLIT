# School Management System (SMS) - PRD

## Original Problem Statement
Build a commercial-grade School Management System for private schools in Libya with:
- Multi-tenant SaaS architecture
- Arabic (RTL) as primary language, English as secondary
- 8 user roles with role-based dashboards
- License & activation system for commercial sale

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python) + MongoDB
- **Authentication**: JWT + Google OAuth (Emergent Auth)
- **AI Integration**: OpenAI GPT via Emergent LLM Key

## User Personas
1. **Super Admin**: Software vendor managing all schools, licenses, support
2. **School Admin**: School owner managing their school operations
3. **School Manager**: Day-to-day school management
4. **Teacher**: Class management, grades, attendance
5. **Student**: View grades, schedule, assignments
6. **Parent**: Monitor child's performance and finances
7. **Accountant**: Financial management, invoicing
8. **Support Agent**: Technical support for vendor

## Core Requirements (Static)
- Multi-tenant data isolation per school
- Full RTL support for Arabic
- License management with activation/expiration
- Role-based access control
- Dashboard with charts and analytics
- Student/Teacher/Finance management

## What's Been Implemented (Phase 1)
**Date: 2026-01-30**

### Backend
- FastAPI server with MongoDB integration
- JWT authentication + Google OAuth ready
- HTTPS redirect middleware for secure communication
- Complete CRUD APIs for:
  - Users & Authentication
  - Schools management
  - Students management
  - Teachers management
  - Licenses (create, activate, suspend, renew)
  - Finance (invoices, payments)
  - Academic (grades, subjects, exams, attendance)
  - Notifications
  - AI Chat (GPT integration)

### Frontend
- RTL/LTR language support (Arabic/English)
- Dark/Light theme toggle
- Landing page with pricing
- Login/Register with JWT and Google OAuth
- Role-based dashboards:
  - Super Admin: Schools, licenses, revenue stats
  - School Admin: Students, teachers, finance, attendance
- Pages: Dashboard, Schools, Licenses, Students, Finance, AI Assistant
- Recharts integration for data visualization
- Shadcn UI components throughout

### Integrations
- Google OAuth via Emergent Auth
- GPT text generation via Emergent LLM Key
- SMS ready (Twilio structure in place)

## Prioritized Backlog

### P0 - Critical (Next Sprint)
1. Complete Teachers management page
2. Grades/Classes/Sections management
3. Subjects assignment to teachers
4. Exam creation and grading

### P1 - High Priority
1. Attendance recording system
2. Report cards generation
3. Parent portal
4. Notifications with SMS integration

### P2 - Medium Priority
1. Document templates (certificates, transcripts)
2. Academic calendar
3. Bulk import (students/teachers)
4. Export to PDF/Excel

### P3 - Future Enhancements
1. Mobile app (React Native)
2. Payment gateway integration
3. ERP/Government system integration
4. Advanced analytics

## Next Tasks
1. Fix chart responsive container warnings
2. Implement Teachers management page
3. Add Grades/Sections management
4. Implement Attendance recording
5. Add notification sending with SMS

## Test Accounts
- **Super Admin**: admin@schoolsms.ly / admin123
- **School Admin (Al-Noor)**: ahmed@alnoor.edu.ly / school123
- **Student**: student1@alnoor.edu.ly / student123
