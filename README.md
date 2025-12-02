# MediTrack AI - Healthcare Management System

## Project Overview

**MediTrack AI** is a comprehensive healthcare management platform that connects patients with doctors through real-time features, AI-powered diagnostics, medicine management, and emergency services.

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19.2, Vite, Tailwind CSS |
| **Backend** | Node.js, Express 5.1 |
| **Database** | MongoDB with Mongoose 9.0 |
| **Real-time** | Socket.IO 4.8 |
| **AI Integration** | Google Gemini AI |
| **Video Calls** | ZegoCloud |
| **Maps** | React-Leaflet / OpenStreetMap |
| **File Storage** | Cloudinary |
| **Email** | SendGrid |
| **SMS** | Twilio |

---

## Architecture

```
Se_project/
├── Backend/
│   ├── src/
│   │   ├── controllers/     # Business logic (13 controllers)
│   │   ├── models/          # MongoDB schemas (12 models)
│   │   ├── routes/          # API endpoints (13 route files)
│   │   ├── middleware/      # Auth, error handling, uploads
│   │   ├── services/        # Email, SMS, Cron jobs
│   │   ├── utils/           # Helpers (haversine, seed data)
│   │   └── server.js        # Express + Socket.IO server
│   └── uploads/             # Local file storage
│
└── frontend/
    ├── src/
    │   ├── pages/           # 19 page components
    │   ├── components/      # Reusable UI (Layout, Chat)
    │   ├── services/        # API integration (9 modules)
    │   ├── context/         # AuthContext
    │   ├── hooks/           # useAuth, useWebSocket
    │   └── App.jsx          # Router configuration
    └── public/
```

---

## User Roles

### Patient
- Book appointments with doctors
- Track vital signs (BP, heart rate, blood sugar, etc.)
- Manage medicine reminders with adherence tracking
- View prescriptions and medical reports
- Set and track health goals
- Use AI symptom checker (image analysis)
- Chat with doctors
- Emergency SOS with location sharing
- Track doctor location in real-time

### Doctor
- View and manage patients
- Approve/cancel appointments
- Create prescriptions and medical reports
- Monitor patient vitals with trend charts
- Comment on medicine adherence
- Share real-time location
- Respond to emergency alerts
- Video call with patients

---

## Key Features

### 1. Authentication System
- JWT-based authentication (7-day token expiry)
- Role-based access control (Patient/Doctor)
- Password reset via email OTP (6-digit, 10-min expiry)
- bcrypt password hashing

### 2. Appointment Management
- Patients book appointments with reason
- Doctors confirm/cancel with notes
- Email notifications on status changes
- Appointment history tracking

### 3. Medicine Reminders
- Schedule medicines with multiple daily timings
- Frequency: once, twice, thrice, custom
- Cron job checks every minute for due reminders
- SMS + Email + Push notification
- Adherence tracking with doctor comments

### 4. Vital Signs Monitoring
- Track: Blood pressure, heart rate, blood sugar, weight, temperature, oxygen level
- **Automatic Health Alerts** when vitals exceed thresholds:
  - BP: High (>=140/90), Low (<=90/60)
  - Heart Rate: High (>100 bpm), Low (<50 bpm)
  - Blood Sugar: High (>180 mg/dL), Low (<70 mg/dL)
  - Temperature: Fever (>38°C)
- Real-time WebSocket alerts to doctors

### 5. AI Health Assistant (Chatbot)
- Powered by Google Gemini AI
- Session-based conversation history
- Medical advice with doctor consultation disclaimer
- Plain text responses (no markdown)

### 6. Symptom Checker
- Upload symptom images (skin conditions, injuries)
- AI-powered analysis using Gemini Vision
- Returns: description, potential causes, home care, when to see doctor

### 7. Live Doctor Tracking
- MongoDB geospatial queries (2dsphere index)
- Real-time location updates via WebSocket
- ETA calculation using Haversine formula
- Find nearby available doctors

### 8. Emergency SOS
- One-tap emergency button
- Broadcasts alert to all doctors
- Includes patient location
- Doctors respond via app
- Creates emergency notifications

### 9. Video Calls
- ZegoCloud integration
- One-on-one calls
- Screen sharing capability
- Call notifications via WebSocket

### 10. Messaging
- Real-time chat between patient and doctor
- Message history persistence
- Read status tracking

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register patient/doctor |
| POST | `/login` | User login |
| POST | `/forgotpassword` | Request password reset |
| PUT | `/resetpassword` | Reset with OTP |
| GET | `/me` | Get current user |
| GET | `/doctors` | List all doctors |
| GET | `/my-doctors` | Patient's doctors |
| GET | `/patients` | Doctor's patients |

### Appointments (`/api/appointments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's appointments |
| POST | `/` | Create appointment |
| PATCH | `/:id` | Update appointment |

### Medicines (`/api/medicines`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get active medicines |
| POST | `/` | Add medicine |
| PATCH | `/:id` | Update medicine |
| PATCH | `/:id/taken` | Mark as taken |
| DELETE | `/:id` | Delete medicine |

### Vitals (`/api/vitals`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user vitals |
| POST | `/` | Add vital |
| GET | `/patient/:id` | Get patient vitals |
| DELETE | `/:id` | Delete vital |

### Prescriptions (`/api/prescriptions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/my` | Patient's prescriptions |
| GET | `/patient/:id` | Specific patient |
| POST | `/` | Create prescription |
| PUT | `/:id` | Update prescription |

### Reports (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/my` | Patient's reports |
| GET | `/patient/:id` | Specific patient |
| POST | `/` | Create report |
| PUT | `/:id` | Update report |

### Chatbot (`/api/chatbot`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/message` | Send message |
| GET | `/history` | Get chat history |

### Symptom (`/api/symptom`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze symptom image |

### Tracking (`/api/tracking`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/update` | Update doctor location |
| GET | `/doctors` | Get nearby doctors |
| GET | `/doctor/:id` | Get doctor location |

### Goals (`/api/goals`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user goals |
| POST | `/` | Create goal |
| PUT | `/:id` | Update progress |
| DELETE | `/:id` | Delete goal |

### Messages (`/api/messages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:userId` | Get conversation |
| POST | `/` | Send message |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get notifications |
| PUT | `/:id/read` | Mark as read |

---

## WebSocket Events

### Patient Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `patient:emergency` | Emit | Trigger SOS alert |
| `patient:track:doctor` | Emit | Request doctor tracking |
| `patient:update` | Receive | Get updates from doctor |
| `patient:health_alert` | Receive | Vital sign warnings |

### Doctor Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `doctor:location:update` | Emit | Share location |
| `doctor:emergency:response` | Emit | Respond to SOS |
| `doctor:location:updated` | Receive | Location broadcast |
| `emergency:alert` | Receive | Patient SOS |

### Shared Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `message:receive` | Receive | New chat message |
| `video:call:invite` | Receive | Incoming call |
| `medicine:reminder:{userId}` | Receive | Medicine due |

---

## Database Models

1. **User** - Patients and doctors with role-specific fields
2. **Appointment** - Doctor-patient meetings
3. **Medicine** - Reminders with adherence tracking
4. **MedicineLog** - Individual intake records
5. **Vital** - Health measurements
6. **Prescription** - Doctor prescriptions
7. **Report** - Medical reports
8. **ChatHistory** - AI chatbot conversations
9. **Message** - Doctor-patient messages
10. **Notification** - System notifications
11. **DoctorLocation** - Geospatial doctor positions
12. **Goal** - Health goals

---

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/meditrack
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# SendGrid
SENDGRID_API_KEY=xxx
EMAIL_FROM=noreply@meditrack.com

# Twilio
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# Google Gemini
GEMINI_API_KEY=xxx
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_ZEGO_APP_ID=xxx
VITE_ZEGO_SERVER_SECRET=xxx
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Se_project

# Backend setup
cd Backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Running
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

---

## Project Statistics

- **Backend Controllers:** 13
- **Database Models:** 12
- **API Endpoints:** 60+
- **Frontend Pages:** 19
- **WebSocket Events:** 10+
- **External Integrations:** 5 (Cloudinary, SendGrid, Twilio, Gemini, ZegoCloud)

---

## License

ISC License

---

## Contributors

Software Engineering Project Team
