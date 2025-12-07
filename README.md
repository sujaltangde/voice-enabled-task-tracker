# Voice-Enabled Task Tracker

A modern, full-stack task management application with AI-powered voice input capabilities. Create, organize, and manage tasks using natural speech or traditional text input.

---

## Table of Contents

1. Project Setup
2. Tech Stack
3. API Documentation
4. Decisions & Assumptions
5. AI Tools Usage

---

## Project Setup

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: v14.x or higher (or use a hosted database like Neon, Supabase, or Railway)
- **ElevenLabs API Key**: Required for speech-to-text transcription
- **OpenAI API Key**: Required for AI task parsing from transcribed text

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/sujaltangde/voice-enabled-task-tracker.git
cd voice-enabled-task-tracker
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/task_tracker
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=4000
```

**Database Setup:**
- The application uses TypeORM with `synchronize: true`, so tables will be created automatically on first run
- No manual migrations required for development

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:4000/api
```

> **Note:** The frontend defaults to `http://localhost:4000/api` if `VITE_API_URL` is not set.

### Running the Application

#### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:4000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### Seed Data

No seed scripts are required. The application starts with an empty task list. You can:
- Create tasks manually via the UI
- Use voice input to create tasks
- Import tasks via the API

---

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with React Icons
- **Drag & Drop**: react-dnd with HTML5 backend
- **HTTP Client**: Axios
- **Notifications**: react-toastify

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5
- **Database**: PostgreSQL
- **ORM**: TypeORM 0.3
- **Validation**: Zod 4
- **AI Integration**: ElevenLabs API (speech-to-text transcription), OpenAI API (GPT for task parsing)
- **File Uploads**: express-fileupload
- **Date Handling**: Moment.js
- **CORS**: cors middleware

### Database
- **Type**: PostgreSQL (Relational Database)
- **Schema**: Single `tasks` table with UUID primary keys
- **ORM**: TypeORM with automatic synchronization

### AI Providers
- **ElevenLabs**: Speech-to-text transcription
  - **Model**: `scribe_v1` with diarization and audio event tagging
- **OpenAI**: Natural language task parsing
  - **Model**: `gpt-4.1-mini` for intelligent task field extraction

### Key Libraries
- **Validation**: Zod (runtime type validation)
- **File Upload**: express-fileupload (multipart/form-data handling)
- **Date Parsing**: Moment.js (flexible date parsing)
- **UUID**: uuid v13 (unique identifiers)

---

## API Documentation

**Base URL:** `http://localhost:4000/api`

### Endpoints

#### 1. Get All Tasks
**GET** `/tasks`

Returns all tasks ordered by creation date (newest first).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Complete project documentation",
      "description": "Write comprehensive README",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "due_date": "2025-12-31T00:00:00.000Z",
      "created_at": "2025-12-06T10:00:00.000Z",
      "updated_at": "2025-12-06T10:00:00.000Z"
    }
  ]
}
```

---

#### 2. Create Task
**POST** `/tasks`

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Description",
  "status": "TODO",
  "priority": "MEDIUM",
  "due_date": "2025-12-31"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Task title",
    "description": "Description",
    "status": "TODO",
    "priority": "MEDIUM",
    "due_date": "2025-12-31T00:00:00.000Z",
    "created_at": "2025-12-06T10:00:00.000Z",
    "updated_at": "2025-12-06T10:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": "body.title",
      "message": "Title is required"
    }
  ]
}
```

---

#### 3. Create Task from Voice
**POST** `/tasks/voice`

Upload audio file and AI will transcribe (using ElevenLabs) and parse it (using OpenAI) into task fields.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Field name:** `voice` (audio file)

**Supported Formats:** webm, wav, mp3, mpeg, ogg, mp4  
**Max Size:** 10MB

**Success Response (200):**
```json
{
  "success": true,
  "transcript": "I need to buy groceries tomorrow including milk bread and eggs",
  "data": {
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "status": "TODO",
    "priority": "MEDIUM",
    "due_date": "2025-12-08"
  }
}
```

**Note:** This endpoint returns parsed task data but does NOT save the task to the database. The frontend uses this data to populate the task creation form, allowing users to review/edit before saving.

**Error Response (400):**
```json
{
  "success": false,
  "message": "No audio file provided"
}
```

---

#### 4. Update Task Status
**PATCH** `/tasks/:id/status`

Quick status update endpoint (for drag & drop).

**Request Body:**
```json
{
  "status": "IN_PROGRESS" 
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Complete project documentation",
    "description": "Write comprehensive README",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "due_date": "2025-12-31T00:00:00.000Z",
    "created_at": "2025-12-06T10:00:00.000Z",
    "updated_at": "2025-12-06T10:30:00.000Z"
  }
}
```

---

#### 5. Update Task
**PUT** `/tasks/:id`

Update any task fields.

**Request Body:** 
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "DONE",
  "priority": "LOW",
  "due_date": "2025-12-25"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Updated title",
    "description": "Updated description",
    "status": "DONE",
    "priority": "LOW",
    "due_date": "2025-12-25T00:00:00.000Z",
    "created_at": "2025-12-06T10:00:00.000Z",
    "updated_at": "2025-12-06T11:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

#### 6. Delete Task
**DELETE** `/tasks/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": { "id": "uuid" }
}
```

---

### Common Error Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `404` | Not Found |
| `413` | Payload Too Large |
| `500` | Internal Server Error |

---

## Decisions & Assumptions

### Key Design Decisions

#### 1. **Database Model**
- **Single Entity Design**: Used a simple `Task` entity with all necessary fields (title, description, status, priority, due_date)
- **UUID Primary Keys**: Chose UUIDs over auto-increment IDs for better distributed system compatibility and security
- **Enum Types**: Used PostgreSQL enum types for `status` and `priority` to ensure data integrity
- **Timestamps**: Added `created_at` and `updated_at` for audit trails

#### 2. **Voice Processing Flow**
```
User speaks → MediaRecorder captures audio → Frontend uploads .webm file
→ Backend receives multipart/form-data → ElevenLabs API transcribes audio (scribe_v1 model)
→ OpenAI GPT-4.1-mini parses transcript → Extracts task fields (title, description, priority, status, due_date)
→ Returns structured task object → Frontend populates form fields
```

#### 3. **State Management**
- **Redux Toolkit**: Chosen for predictable state management across components
- **Slices**: Single `taskSlice` manages all task-related state (list, filters, voice input)
- **Optimistic Updates**: UI updates immediately, with rollback on API failure

#### 4. **Validation Architecture**
- **Zod Schemas**: Runtime validation at API boundaries
- **Middleware Pattern**: Centralized validation before controller execution
- **Type Safety**: Zod schemas infer TypeScript types automatically

#### 5. **Error Handling**
- **Global Error Handler**: Single middleware catches all errors
- **Custom AppError Class**: Distinguishes operational errors from programmer errors
- **AsyncHandler Wrapper**: Eliminates repetitive try-catch blocks

### Assumptions Made

#### 1. **Data Assumptions**
- Users won't need task categorization or tags (can be added later)
- Tasks are personal (no multi-user/sharing features)
- No subtasks or task dependencies required
- Date format flexibility handled by Moment.js

#### 2. **Voice Input Assumptions**
- Users will speak in English (ElevenLabs `scribe_v1` configured for `eng` language code)
- Audio quality is reasonable (ElevenLabs handles noise well with audio event tagging)
- Users will mention task details naturally ("I need to X by Y date")
- Maximum recording time not enforced client-side (10MB file limit covers ~10 minutes)
- GPT parsing can handle relative dates ("tomorrow", "next week") using provided timestamp

#### 3. **Technical Assumptions**
- Single-server deployment (no load balancing required)
- PostgreSQL handles all traffic (no caching layer needed for MVP)
- `synchronize: true` acceptable for development (should disable in production)
- CORS open to all origins (should restrict in production)

#### 4. **Limitations Acknowledged**
- No email sending/receiving (not in requirements)
- No authentication/authorization (single-user assumption)
- No real-time updates (WebSocket not needed)
- No pagination (manageable task count assumed)

---

## AI Tools Usage

I used AI tools as coding assistants throughout this project, primarily **Cursor AI** for autocomplete and quick refactoring, along with **ChatGPT** for specific technical questions.

### Where AI Helped

**Boilerplate & Setup**
- React with Vite and Tailwind CSS project initialization
- Node.js Express server setup with TypeScript
- Initial TypeORM entity structure and TypeScript configurations
- Redux store setup and slice patterns
- Validation schema templates with Zod

**Problem Solving**
- Debugging TypeORM synchronization issues with PostgreSQL
- Research on ElevenLabs vs OpenAI Whisper for speech-to-text
- Best practices for Express error handling patterns

**Documentation**
- Structuring API documentation format
- Writing clear validation error messages

### What I Built Myself

- Complete voice input flow (MediaRecorder → backend upload → AI processing)
- Task management logic and state synchronization
- UI components with drag-and-drop functionality
- API integration and error handling strategy
- Database schema design and relationships

### Key Takeaways

AI tools accelerated development, especially for boilerplate code and TypeScript type definitions. However, the core architecture decisions, feature implementation, and debugging were human-driven. I found AI most useful when I had a clear idea of what I wanted to build.

---
