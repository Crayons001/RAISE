# Road Accident Reporting System – System Description

## Overview

This system is a hybrid (mobile and web) platform for digitizing road accident reporting and insurance claim processes in Kenya. It includes modules for police officers, insurance companies, and vehicle owners. The system is built using Flutter for mobile, Flask for backend (Python), and Tailwind CSS + basic HTML for simple web UIs.

## Modules

### 1. Police Module (Mobile - Flutter)

Used by police officers to:
- Report new accidents from the field.
- Upload police abstracts.
- Save unsent/incomplete reports (spam reports).
- View personal profile.
- Generate routine accident signals on request.

#### Key Features:
- Multi-step accident reporting form with:
  - Vehicle, driver, and insurance details.
  - Media upload (images/videos).
  - Auto-location capture via GPS.
- Abstract upload linked to specific accidents.
- Offline-first handling with resend queue.
- Signal generation for recent reports (auto or manual).
- Firebase or custom backend integration for storage.

---

### 2. Insurance Module (Web - Tailwind CSS + Flask Backend)

Used by insurance companies to:
- Receive instant notifications when an accident involving one of their clients is reported.
- View submitted accident details including location, time, images, and driver details.
- View and download police abstracts.
- Flag suspicious/fraudulent reports for review.

---

### 3. Vehicle Owner Module (Web - Tailwind CSS)

Allows vehicle buyers or owners to:
- View the accident history of a specific vehicle using the registration number.
- Search returns a list of past accidents, dates, police stations involved, and optionally images/abstracts.
- Provides transparency for second-hand car market.

---

## Machine Learning Integration (Python Backend – Flask)

A fraud detection module is integrated in the backend to:
- Analyze incoming accident reports.
- Use rule-based and ML-based heuristics to flag potentially fraudulent reports.
- Update report status with flags or risk scores.
- Triggers alerts to insurance dashboards.

---

## Technologies Used

| Layer | Technology |
|------|-------------|
| Mobile App | Flutter (Dart) |
| Backend | Flask (Python), SQLite/PostgreSQL |
| Web Frontend | Tailwind CSS, HTML, JS (minimal) |
| Auth | Firebase Auth / Flask-Login |
| Storage | Firebase Storage or S3 |
| ML | Python (Scikit-learn, Pandas) |
| State Management | Riverpod or Provider (Flutter) |

---

## Developer Notes

- Follow modular code architecture.
- Maintain separation of concerns (UI, logic, data).
- Mobile and backend should communicate via secure REST API.
