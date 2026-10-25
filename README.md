# Family Compass

# MASTER PROMPT: Build a Professional SENTINX-Inspired Self-Hosted Android Device Management and Parental Control System

## 1. Your Role

Act as a senior software architect, Android developer, full-stack engineer, database architect, DevOps engineer, UI/UX designer, QA engineer, and application security specialist.

Your task is to help me plan, design, develop, test, deploy, document, and maintain a complete Android + Web Dashboard + Backend system inspired by the publicly described features of SENTINX.

Reference website: https://sentinx.digital/

Do not assume access to SENTINX's private source code. Do not claim to reproduce its exact implementation. Treat it only as a product reference for general functionality and architecture.

The objective is to build an original, professional, privacy-conscious, self-hostable parental-control and device-management platform.

## 2. Project Goals

Build a complete system consisting of:

1. An Android companion application.
2. A responsive web-based administration dashboard.
3. A secure backend API.
4. A relational database.
5. A real-time communication layer.
6. An optional AI reporting assistant.
7. A self-hosted deployment configuration.
8. Documentation, automated tests, and maintenance tools.

Primary goals:

- Start with zero or minimal financial cost.
- Prefer open-source technologies and free development tools.
- Support local development on Windows.
- Make the dashboard usable on desktop and mobile browsers.
- Allow authorized users to manage their own enrolled devices.
- Keep Android and web interfaces synchronized through secure APIs.
- Make the system modular, maintainable, and easy to extend.
- Avoid unnecessary third-party services and recurring costs.
- Never promise that all advanced features can operate without platform restrictions or paid infrastructure.

## 3. Required Technology Stack

Evaluate and recommend a practical, compatible stack before implementation.

Preferred options:

### Android
- Kotlin
- Android Studio
- Jetpack Compose
- AndroidX libraries
- WorkManager for appropriate scheduled background work
- UsageStatsManager for permitted application-usage summaries
- Fused Location Provider or an appropriate Android location API
- MediaProjection for user-authorized screen sharing, if implemented
- Android's official permission and foreground-service mechanisms

### Web Dashboard
- React or Next.js
- TypeScript
- Tailwind CSS
- A reusable component system
- Accessible charts, tables, forms, dialogs, and navigation
- Responsive desktop, tablet, and mobile layouts

### Backend
- Node.js with TypeScript
- Express or Fastify
- REST API
- WebSocket for authorized real-time updates
- Input validation and centralized error handling
- Rate limiting and authentication middleware

### Database
- PostgreSQL
- Database migrations
- Foreign keys and appropriate indexes
- Data-retention and deletion mechanisms

### Development and Deployment
- Git and GitHub
- Docker Compose where practical
- Environment variables and secret management
- Automated tests and CI workflows
- A self-hosted Linux server as the eventual deployment option

Explain the advantages, disadvantages, compatibility, and actual costs of the selected technologies.

Do not introduce unnecessary technologies. Select the simplest reliable architecture that meets the requirements.

## 4. Functional Requirements

Implement the system in phases.

### Phase A: Authentication and Device Enrollment
- Registration and login
- Secure password hashing
- Session management
- Password reset strategy
- Device enrollment using expiring pairing codes
- Device ownership verification
- Device list and connection status
- Device removal and access revocation
- Role-based access control where necessary
- Audit logs for important actions

A device must not be accessible merely because someone knows its identifier.

### Phase B: Web Dashboard
Create a professional dashboard containing:

- Overview page
- Enrolled devices
- Device details
- Last-seen status
- Authorized location history
- Application-usage summaries
- Reports and charts
- Consent and permissions status
- Notification settings
- Account settings
- Security settings
- Data export and deletion controls
- Audit history

Use realistic loading, empty, error, and success states.

Do not use fake statistics in production. Clearly label demo data during development.

### Phase C: Android Companion App
Build an original Android application with:

- First-launch onboarding
- Clear explanation of every requested permission
- Account sign-in or secure device pairing
- Device enrollment status
- Permission-status screen
- Location-sharing controls
- Application-usage access instructions
- Sync status
- Background-work status
- Data collection preferences
- Disconnect and unenroll controls
- Privacy policy and support information

Use Android's official APIs and current platform requirements.

Request permissions only when the associated feature is enabled and explain why they are necessary.

### Phase D: Location Features
- Request appropriate location permission.
- Provide visible location-sharing controls.
- Send only the location data the user has authorized.
- Store timestamps and location accuracy when available.
- Display authorized location records on a map.
- Support configurable update intervals.
- Handle unavailable GPS, offline devices, and denied permissions.
- Implement retention limits and deletion controls.

Do not promise uninterrupted background tracking. Explain Android background-location restrictions, battery impact, and manufacturer-specific limitations.

### Phase E: Application-Usage Reports
- Use UsageStatsManager where supported.
- Explain how the user grants Usage Access through Android settings.
- Collect only the minimum required usage information.
- Display daily and weekly summaries.
- Support basic charts and date filters.
- Handle unavailable, incomplete, or revoked usage access.
- Allow the user to disable synchronization and delete stored reports.

Do not attempt to bypass Android permission requirements.

### Phase F: Notifications and Alerts
- Device online/offline changes
- Permission changes
- Location-sharing status
- Configurable safety alerts
- User-visible synchronization errors

Implement notifications only for documented, authorized events.

### Phase G: AI Reporting Assistant
Optionally integrate a supported AI provider such as Gemini or Groq.

Possible capabilities:
- Summarize application-usage reports.
- Answer questions about authorized dashboard data.
- Explain trends and unusual changes.
- Generate understandable daily and weekly summaries.
- Provide Bengali and English responses.

Requirements:
- Never send raw personal data to an AI provider without explicit disclosure and appropriate authorization.
- Minimize and redact data before transmission.
- Keep API keys on the backend.
- Enforce authentication and data-access restrictions before generating summaries.
- Provide a non-AI fallback.
- Explain provider pricing, quotas, privacy policies, and limitations.
- Do not claim that an API is free forever.

### Phase H: Advanced Features — Separate Feasibility Review Required

Evaluate each feature independently before implementation:

1. User-initiated screen sharing through MediaProjection.
2. Geofencing and configurable location alerts.
3. Device-side reminders and permitted restriction mechanisms.
4. Remote lock or other device-management operations.
5. Optional camera or microphone streaming initiated through a visible user-controlled workflow.

For every advanced feature, document:
- Supported Android versions
- Required permissions
- User-consent flow
- Foreground-service requirements
- Hardware and manufacturer limitations
- Security implications
- Battery and network costs
- Testing requirements
- Whether a device-owner or enterprise-management configuration is required

Never bypass Android security, consent dialogs, or platform restrictions.

Do not implement covert camera or microphone access, hidden screen recording, keylogging, unauthorized SMS or call-log collection, credential theft, stealth persistence, permission evasion, or remote surveillance without the device user's knowledge.

If a feature is unsupported or unsafe, explain why and offer a transparent, permission-based alternative.

## 5. Backend Architecture

Design the backend with clearly separated modules:

- Authentication
- User management
- Device enrollment
- Device ownership and authorization
- Consent and permission records
- Location records
- Usage summaries
- Notifications
- AI reports
- Audit logs
- Data export and deletion

Define API contracts before implementation.

Provide example endpoints such as:

- POST /api/auth/register
- POST /api/auth/login
- POST /api/devices/pair
- GET /api/devices
- GET /api/devices/:deviceId
- POST /api/devices/:deviceId/consent
- POST /api/devices/:deviceId/location
- GET /api/devices/:deviceId/locations
- GET /api/devices/:deviceId/usage
- GET /api/devices/:deviceId/status
- DELETE /api/devices/:deviceId

These are proposed routes, not pre-existing APIs. Refine them according to the final architecture.

For every endpoint, document:
- HTTP method
- Request schema
- Response schema
- Authentication requirements
- Ownership checks
- Input validation
- Error codes
- Rate limits
- Audit requirements

Use strict ownership checks for every device-related operation.

## 6. Database Design

Propose a normalized PostgreSQL schema covering:

- users
- sessions or refresh-token records
- devices
- device_pairing_codes
- device_consents
- location_records
- usage_summaries
- notification_preferences
- audit_logs
- data_deletion_requests

Include:
- SQL migrations
- Primary and foreign keys
- Unique constraints
- Appropriate indexes
- Timestamp handling
- Retention policies
- Cascading-deletion decisions
- Backup and restoration procedures

Avoid storing unnecessary sensitive information.

Do not store plaintext passwords, authentication secrets, or long-lived device credentials in ordinary application tables without appropriate protection.

## 7. UI/UX Design Requirements

Act as a senior product designer.

Create an original, modern, professional interface.

Design requirements:
- Consistent spacing and typography
- Clear visual hierarchy
- Responsive layouts
- Accessible contrast
- Reusable components
- Appropriate loading and empty states
- Useful error messages
- Clear privacy and permission indicators
- Desktop sidebar and mobile navigation where appropriate
- Charts that remain readable on small screens

Prepare wireframes before implementing complex pages.

Document the component library, design tokens, navigation structure, and reusable layouts.

Do not copy SENTINX branding, proprietary assets, or exact page designs. Build an original interface with comparable general usability.

## 8. Security and Privacy Requirements

Use a security-first design.

Implement:
- HTTPS in deployed environments
- Secure password hashing
- Strict authorization checks
- Short-lived enrollment codes
- Secure token storage
- Rate limiting
- Request validation
- Protection against common web vulnerabilities
- Secret management
- Restricted database access
- Safe logging without unnecessary personal information
- Audit trails for sensitive operations
- Data minimization
- Retention and deletion controls
- Secure backups
- Dependency vulnerability checks
- A documented incident-response process

Never trust the Android client to enforce authorization by itself. Enforce all critical security rules on the backend.

Document every collected data category, its purpose, storage location, retention period, and deletion method.

## 9. Free-First Deployment Strategy

The project must be developed locally first.

Step 1:
Install the required development tools on Windows.

Step 2:
Create the Git repository and project structure.

Step 3:
Run the database and backend locally.

Step 4:
Build the dashboard and connect it to the backend.

Step 5:
Build and install the Android application on a test device.

Step 6:
Test enrollment, authentication, authorized data synchronization, and dashboard updates.

Step 7:
Deploy a development version to a suitable free-tier service, if available.

Step 8:
Document how to deploy the backend to a self-managed Linux server.

Explain:
- Which components are genuinely free
- Which services have usage limits
- Whether a credit card is required
- Sleep, storage, bandwidth, and runtime limitations
- Domain and HTTPS requirements
- Database backup limitations
- Potential AI API charges
- Migration from free hosting to a self-hosted VPS

Do not promise permanent free hosting or uninterrupted operation.

Keep the application portable so that the backend can be moved to another server without rewriting the entire project.

## 10. Testing and Quality Assurance

Create a test strategy covering:

- Unit tests
- API integration tests
- Database migration tests
- Authentication tests
- Authorization and device-isolation tests
- Android permission-denial scenarios
- Offline and reconnect scenarios
- Data-deletion tests
- Responsive UI tests
- Dependency and security checks
- Backup restoration
- End-to-end testing on a real Android device

A feature is not complete merely because the code compiles.

Define acceptance criteria for every phase.

## 11. Required Deliverables

Produce the following in order:

1. Project feasibility report
2. Complete requirements specification
3. System architecture diagram
4. Technology selection and cost analysis
5. Database schema
6. API specification
7. UI/UX page inventory and wireframes
8. Repository and folder structure
9. Installation instructions
10. Working backend source code
11. Working web dashboard source code
12. Working Android application source code
13. Automated tests
14. Environment-variable example file without real secrets
15. Database migrations and seed data for development
16. Local development instructions
17. Deployment configuration
18. Security and privacy checklist
19. Troubleshooting guide
20. Maintenance and backup documentation

When code files are requested, provide complete, internally consistent files rather than disconnected fragments.

Do not claim to have created, tested, deployed, or published anything unless that action has actually been completed and verified.

## 12. Working Method

Follow these rules throughout development:

1. Start by analyzing the requirements and identifying uncertainties.
2. Explain the architecture in plain language.
3. Divide the project into small, testable milestones.
4. Complete one milestone before starting the next.
5. List the exact files to create or modify.
6. Provide complete code for the current milestone.
7. Explain where each file belongs.
8. Provide exact installation and run commands for Windows PowerShell when relevant.
9. Explain expected output and how to verify it.
10. Diagnose actual errors before suggesting fixes.
11. Keep the frontend, backend, Android app, and database compatible.
12. Maintain a project status report after each milestone.
13. Avoid rewriting working components unnecessarily.
14. Ask questions only when a missing decision materially affects the implementation.
15. Prefer practical, low-cost solutions without compromising security.

If an external service, repository, deployment provider, or API is unavailable, explain the limitation and provide a realistic alternative.

Do not fabricate test results, URLs, API capabilities, credentials, or deployment status.

## 13. First Task: Begin the Project

Do not generate the entire codebase in one enormous response.

Start with:

A. A clear explanation of the complete system.

B. A feature-by-feature feasibility table classifying each feature as:
- Easy
- Moderate
- Difficult
- Platform-restricted
- Requires separate legal or security review

C. A free-first technology stack.

D. A system architecture diagram.

E. A phased development roadmap.

F. A realistic cost and hosting analysis.

G. The exact first-day setup instructions for a Windows computer.

H. The first small, working milestone that can be tested before moving forward.

Assume I want to learn and build this project step by step. Explain technical concepts in simple language while maintaining professional engineering standards.

Begin with planning and local setup. Do not skip directly to advanced surveillance or remote-control features.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/742c5178-e625-4508-bc99-c37190f63bd4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
