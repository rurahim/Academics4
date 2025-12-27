# Academics4 - Multi-Match Volunteer Teacher & Student Platform
## Complete Project Documentation & Development Guide

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Core Features](#core-features)
6. [Matching Algorithm](#matching-algorithm)
7. [User Flows](#user-flows)
8. [Technical Stack](#technical-stack)
9. [Development Modules](#development-modules)
10. [API Endpoints](#api-endpoints)
11. [UI/UX Specifications](#uiux-specifications)
12. [Security & Privacy](#security--privacy)

---

## 🎯 Project Overview

**Project Name:** Academics4  
**Mission:** Connecting volunteer teachers with students in war-affected areas through an intelligent multi-match system

### Key Objectives:
- Enable students to match with multiple volunteers for different subjects
- Allow volunteers to teach multiple students based on capacity
- Create semantic matching based on field expertise and subject knowledge
- Support multiple crisis regions (Gaza, Ukraine, etc.)
- Track learning progress across multiple teacher-student relationships

### Key Differentiators:
- **Multi-Match System:** One student can have multiple teachers for different subjects
- **Semantic Matching:** AI-powered understanding of related fields and subjects
- **Dynamic Capacity:** Volunteers can toggle availability for more students
- **Real-time Updates:** New users trigger immediate match recalculation

### Success Metrics:
- Average number of teachers per student
- Subject coverage percentage
- Volunteer utilization rate
- Match acceptance rate
- Session completion rate

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                       │
├─────────────────────────────────────────────────────────┤
│  Admin Dashboard │ Volunteer Portal │ Student Portal    │
├─────────────────────────────────────────────────────────┤
│                  Authentication Service                  │
├─────────────────────────────────────────────────────────┤
│                     Backend API Layer                    │
├─────────────────────────────────────────────────────────┤
│  User Service │ Semantic Matching Engine │ Session Mgmt │
├─────────────────────────────────────────────────────────┤
│              NLP Service │ Email Service                 │
├─────────────────────────────────────────────────────────┤
│                    Database Layer                        │
├─────────────────────────────────────────────────────────┤
│     PostgreSQL │ Redis Cache │ Vector DB (Pinecone)     │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'volunteer', 'student') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Volunteers Table
```sql
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    age INTEGER,
    phone_number VARCHAR(50),
    city VARCHAR(100),
    country VARCHAR(100),
    area VARCHAR(100),
    university_affiliation VARCHAR(255),
    fields_of_expertise UUID[], -- Array of field IDs from fields_of_study table
    subjects_qualified TEXT[], -- Up to 10 free-text subjects/skills
    languages_spoken TEXT[],
    preferred_language VARCHAR(50),
    online_teaching_experience BOOLEAN DEFAULT false,
    diverse_background_experience BOOLEAN DEFAULT false,
    hours_per_week_available INTEGER,
    
    -- Capacity Management
    current_capacity INTEGER DEFAULT 0, -- Current active students
    max_capacity INTEGER DEFAULT 5, -- Maximum students (set by volunteer or admin)
    capacity_set_by ENUM('volunteer', 'admin') DEFAULT 'volunteer',
    is_available BOOLEAN DEFAULT true, -- Computed: current < max
    
    cause VARCHAR(50) NOT NULL, -- Single cause: 'Gaza', 'Ukraine', etc.
    additional_support_willing TEXT,
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    total_hours_volunteered INTEGER DEFAULT 0,
    students_helped INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_capacity CHECK (current_capacity <= max_capacity)
);

CREATE INDEX idx_volunteer_cause ON volunteers(cause);
CREATE INDEX idx_volunteer_fields ON volunteers USING GIN(fields_of_expertise);
CREATE INDEX idx_volunteer_availability ON volunteers(is_available);
CREATE INDEX idx_volunteer_capacity ON volunteers(current_capacity, max_capacity);
```

### Students Table
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(50),
    phone_number VARCHAR(50),
    alternative_contact VARCHAR(255),
    current_city VARCHAR(100),
    current_country VARCHAR(100),
    area VARCHAR(100),
    original_location VARCHAR(255),
    cause VARCHAR(50) NOT NULL, -- 'Gaza', 'Ukraine', etc.
    fields_of_study UUID[], -- Multiple fields from fields_of_study table
    
    -- Subject Keywords Management (up to 10 free-text keywords)
    topics_need_support JSONB, -- Structure: [{keyword: string, status: 'unassigned'|'assigned', assigned_to: volunteer_id|null}]
    
    original_university VARCHAR(255),
    current_university VARCHAR(255),
    credits_remaining INTEGER,
    has_transcripts BOOLEAN DEFAULT false,
    preferred_language VARCHAR(50),
    languages_spoken TEXT[],
    hours_per_week_needed INTEGER,
    device_access_level INTEGER CHECK (device_access_level BETWEEN 1 AND 5),
    internet_access_level INTEGER CHECK (internet_access_level BETWEEN 1 AND 5),
    materials_access_level INTEGER CHECK (materials_access_level BETWEEN 1 AND 5),
    special_needs TEXT,
    educational_background TEXT,
    career_goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_cause ON students(cause);
CREATE INDEX idx_student_fields ON students USING GIN(fields_of_study);
CREATE INDEX idx_student_topics ON students USING GIN(topics_need_support);
```

### Matches Table (Admin-Controlled)
```sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    
    -- Subject Assignment Tracking
    assigned_subjects TEXT[], -- Which subject keywords this volunteer is handling
    primary_field_id UUID REFERENCES fields_of_study(id),
    
    match_score DECIMAL(5,2),
    auto_suggested BOOLEAN DEFAULT true, -- Was this auto-suggested by system?
    match_reasons JSONB,
    
    status ENUM(
        'auto_suggested',     -- System suggested, awaiting admin review
        'pending_email',      -- Admin approved, email not sent
        'email_sent',         -- Email sent to volunteer
        'accepted',           -- Volunteer accepted
        'active',            -- Currently active
        'rejected',          -- Volunteer rejected
        'not_compatible',    -- Admin marked not compatible
        'completed',         -- Finished
        'paused'            -- Temporarily paused
    ) DEFAULT 'auto_suggested',
    
    rejection_reason TEXT,
    admin_id UUID REFERENCES users(id), -- Admin who approved this match
    admin_notes TEXT,
    
    email_sent_at TIMESTAMP,
    volunteer_responded_at TIMESTAMP,
    
    start_date DATE,
    end_date DATE,
    total_sessions INTEGER DEFAULT 0,
    total_hours DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(student_id, volunteer_id) -- One match per student-volunteer pair
);

CREATE INDEX idx_match_status ON matches(status);
CREATE INDEX idx_match_student ON matches(student_id);
CREATE INDEX idx_match_volunteer ON matches(volunteer_id);
CREATE INDEX idx_match_auto_suggested ON matches(auto_suggested);
```

### Subject Assignment History (Audit Trail)
```sql
CREATE TABLE subject_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_keyword VARCHAR(255),
    assigned_to_volunteer_id UUID REFERENCES volunteers(id),
    assigned_by_admin_id UUID REFERENCES users(id),
    action ENUM('assigned', 'unassigned', 'reassigned'),
    previous_volunteer_id UUID REFERENCES volunteers(id), -- For reassignments
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignment_student ON subject_assignments(student_id);
CREATE INDEX idx_assignment_volunteer ON subject_assignments(assigned_to_volunteer_id);
```

### Email Templates Table
```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL, -- Supports variables like {{student_name}}, {{subjects}}, etc.
    variables JSONB, -- List of available variables
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate with templates
INSERT INTO email_templates (name, subject, body, variables) VALUES
(
    'match_request',
    'New Student Match Request - {{student_name}}',
    'Dear {{volunteer_name}},

We have identified a student who could benefit from your expertise.

Student Details:
- Name: {{student_name}}
- Field: {{field_of_study}}
- Subjects Needing Help: {{subjects}}
- Location: {{student_location}}
- Hours Needed: {{hours_per_week}} hours/week
- Language: {{preferred_language}}

Match Score: {{match_score}}/100
Reason for Match: {{match_reasons}}

Please log in to your dashboard to accept or decline this match.

Best regards,
Academics4 Team',
    '["volunteer_name", "student_name", "field_of_study", "subjects", "student_location", "hours_per_week", "preferred_language", "match_score", "match_reasons"]'
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER,
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    subjects_covered TEXT[], -- Which subject keywords were covered
    volunteer_notes TEXT,
    student_notes TEXT,
    student_attendance BOOLEAN,
    volunteer_attendance BOOLEAN,
    materials_shared JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Feedback Table
```sql
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id),
    given_by UUID REFERENCES users(id),
    given_to UUID REFERENCES users(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    knowledge_rating INTEGER CHECK (knowledge_rating BETWEEN 1 AND 5),
    teaching_rating INTEGER CHECK (teaching_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    subjects_feedback JSONB, -- Per-subject feedback
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Causes Table
```sql
CREATE TABLE causes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    region VARCHAR(100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate with initial causes
INSERT INTO causes (name, description, region) VALUES
('Gaza', 'Support for students affected by conflict in Gaza', 'Palestine'),
('Ukraine', 'Support for students affected by war in Ukraine', 'Ukraine');
```

### Fields of Study Table (Comprehensive - 200+ fields)
```sql
CREATE TABLE fields_of_study (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) UNIQUE NOT NULL,
    category VARCHAR(100),
    parent_field_id UUID REFERENCES fields_of_study(id),
    related_fields UUID[], -- Array of related field IDs for semantic matching
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate with all major fields (same as before)
-- [200+ fields insertion remains the same as in previous version]
```

### Match Scores Cache Table (For Performance)
```sql
CREATE TABLE match_scores_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    field_id UUID REFERENCES fields_of_study(id),
    score DECIMAL(5,2),
    reasons JSONB,
    is_available BOOLEAN, -- Was volunteer available when calculated?
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 hour',
    UNIQUE(student_id, volunteer_id, field_id)
);

CREATE INDEX idx_cache_student ON match_scores_cache(student_id);
CREATE INDEX idx_cache_volunteer ON match_scores_cache(volunteer_id);
CREATE INDEX idx_cache_available ON match_scores_cache(is_available);
CREATE INDEX idx_cache_expiry ON match_scores_cache(expires_at);
```

### Automatic Match Triggers Table
```sql
CREATE TABLE match_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_type ENUM('new_student', 'new_volunteer', 'capacity_change'),
    entity_id UUID, -- Student or Volunteer ID
    processed BOOLEAN DEFAULT false,
    matches_found INTEGER DEFAULT 0,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trigger_unprocessed ON match_triggers(processed) WHERE processed = false;
```

---

## 👥 User Roles & Permissions

### Admin Role
- **Full System Control:**
  - View/Edit all user profiles
  - Manage subject assignments (mark as assigned/unassigned)
  - Control volunteer capacity settings
  - Send match emails using templates
  - Mark matches as "Not Compatible" with reasons
  - View comprehensive analytics
  
- **Subject Assignment Powers:**
  - Assign specific subjects to volunteers
  - Track which subjects are covered
  - Reassign subjects between volunteers
  - View unassigned subject gaps
  
- **Advanced Filtering:**
  - Filter by fields, subjects, status, cause
  - View all match suggestions with scores
  - Access rejection analytics
  - Monitor capacity utilization

### Volunteer Role
- **Limited Access (Privacy-First):**
  - Can ONLY see students assigned by admin
  - Cannot browse student list
  - Cannot see other volunteers
  - View only assigned subjects for their students
  
- **Profile Management:**
  - Add up to 10 free-text subjects/skills
  - Select multiple fields of expertise
  - Set weekly hour availability
  - Manage maximum student capacity (unless admin-locked)
  
- **Student Interaction:**
  - Accept/Reject match invitations sent by admin
  - View assigned student details
  - Track progress for assigned subjects only
  - Provide feedback per student

### Student Role
- **Profile Management:**
  - Add up to 10 free-text topics needing help
  - Select multiple fields of study
  - Set weekly hour requirements
  - Update access levels
  
- **Learning Features:**
  - View volunteers assigned by admin
  - Track which subjects are assigned/unassigned
  - Monitor progress per subject
  - Provide feedback for each volunteer

---

## 🚀 Core Features

### 1. Smart Registration with Free-Text Subject Keywords

#### Volunteer Registration Flow:
1. **Email verification**
2. **Basic information** (name, age, contact)
3. **Location** (city, country, area)
4. **University affiliation**
5. **Cause selection** (single: Gaza, Ukraine, etc.)
6. **Fields of expertise** (multi-select from 200+ predefined fields)
7. **Subject expertise** (free-text, up to 10 keywords):
   - Type any subject/skill and press Enter
   - No predefined list - completely flexible
   - Examples: "Python", "Calculus II", "IELTS Preparation", etc.
8. **Language preferences**
9. **Teaching experience** questions
10. **Weekly hours availability**
11. **Maximum students capacity** (or admin can set)

#### Student Registration Flow:
1. **Email verification**
2. **Basic information** (name, age, gender, contacts)
3. **Current location** (city, country, area)
4. **Original location/university**
5. **Cause** (single: Gaza, Ukraine, etc.)
6. **Fields of study** (multi-select from 200+ predefined fields)
7. **Topics needing support** (free-text, up to 10 keywords):
   - Type any topic and press Enter
   - Completely flexible input
   - Status tracking: "unassigned" by default
8. **Academic status**
9. **Language preferences**
10. **Access levels** (device, internet, materials - 1-5 scale)
11. **Weekly hours needed**

### 2. Subject Assignment Management System

#### Admin Subject Assignment Interface:
```javascript
// Student Subject Management View
{
  student: {
    name: "Ahmed Hassan",
    subjects_needed: [
      { keyword: "Python", status: "assigned", volunteer: "John Smith" },
      { keyword: "Data Structures", status: "assigned", volunteer: "John Smith" },
      { keyword: "Linear Algebra", status: "unassigned", volunteer: null },
      { keyword: "Statistics", status: "assigned", volunteer: "Sarah Lee" },
      { keyword: "Machine Learning", status: "unassigned", volunteer: null }
    ]
  },
  actions: {
    assignSubject: (keyword, volunteerId) => {},
    unassignSubject: (keyword) => {},
    reassignSubject: (keyword, newVolunteerId) => {}
  }
}
```

#### Key Features:
- **Visual Status Indicators:**
  - ✅ Green: Assigned subjects
  - ⚠️ Yellow: Partially assigned
  - ❌ Red: Unassigned subjects
  
- **Bulk Assignment:**
  - Select multiple subjects
  - Assign to same volunteer
  - Track assignment history
  
- **Assignment Rules:**
  - Only assign to volunteers with matching field
  - Check capacity before assignment
  - Prevent over-assignment

### 3. Automatic Matching Triggers

#### New Student Registration Trigger:
```python
def on_new_student_registration(student):
    """
    Automatically triggered when new student registers
    """
    # Step 1: Find all volunteers with capacity
    available_volunteers = find_volunteers_with_capacity(
        cause=student.cause,
        fields=student.fields_of_study,
        exclude_full=True  # Skip volunteers at max capacity
    )
    
    # Step 2: Calculate match scores
    matches = []
    for volunteer in available_volunteers:
        if volunteer.current_capacity < volunteer.max_capacity:
            score = calculate_match_score(volunteer, student)
            if score > 0:  # Show all matches, even low scores
                matches.append({
                    'volunteer': volunteer,
                    'score': score,
                    'auto_suggested': True
                })
    
    # Step 3: Store in matches table as 'auto_suggested'
    for match in matches:
        create_match(
            student_id=student.id,
            volunteer_id=match['volunteer'].id,
            score=match['score'],
            status='auto_suggested'
        )
    
    # Step 4: Notify admin
    notify_admin_new_matches(student, len(matches))
    
    return matches

def on_volunteer_capacity_change(volunteer):
    """
    Triggered when volunteer changes capacity or 'Teach More' status
    """
    if volunteer.current_capacity < volunteer.max_capacity:
        # Find unmatched students
        potential_students = find_unmatched_students(
            cause=volunteer.cause,
            fields=volunteer.fields_of_expertise
        )
        
        # Calculate and suggest matches
        for student in potential_students:
            calculate_and_suggest_match(volunteer, student)
```

### 4. Capacity Management System

#### Volunteer Capacity Controls:
- **Set by Volunteer:**
  - Default max capacity: 5 students
  - Can adjust in profile (1-10 range)
  - Real-time availability indicator
  
- **Override by Admin:**
  - Admin can set different capacity
  - Lock capacity to prevent changes
  - Force availability status

#### Automatic Capacity Updates:
```sql
-- Trigger to update volunteer availability
CREATE OR REPLACE FUNCTION update_volunteer_availability()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE volunteers 
    SET is_available = (current_capacity < max_capacity)
    WHERE id = NEW.volunteer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_capacity_trigger
AFTER INSERT OR UPDATE OR DELETE ON matches
FOR EACH ROW
WHEN (NEW.status IN ('active', 'accepted'))
EXECUTE FUNCTION update_volunteer_availability();
```

### 5. Controlled Volunteer Access

#### Volunteer Portal Restrictions:
- **Can ONLY see:**
  - Students assigned by admin (active matches)
  - Student details for assigned subjects only
  - Cannot browse all students
  
- **Dashboard View:**
  ```javascript
  // Volunteer sees only assigned students
  {
    myStudents: [
      {
        name: "Student Name",
        assignedSubjects: ["Python", "Data Structures"],
        contactInfo: "visible",
        otherSubjects: "hidden" // Cannot see unassigned subjects
      }
    ],
    availableStudents: [] // Empty - no browsing allowed
  }
  ```

### 6. Email Template System

#### Predefined Templates with Variables:
```javascript
// Email Template for Volunteer Match Request
{
  template: "match_request",
  subject: "New Student Match - {{student_name}}",
  body: `
Dear {{volunteer_name}},

We have a new student who needs your expertise:

Student: {{student_name}}
Field: {{field_of_study}}
Subjects Needing Help: {{assigned_subjects}}
Location: {{student_location}}
Hours Needed: {{hours_per_week}} hours/week
Language: {{preferred_language}}

Match Score: {{match_score}}/100

Please log in to accept or decline this match.

Best regards,
Academics4 Team
  `,
  variables: {
    volunteer_name: volunteer.full_name,
    student_name: student.full_name,
    field_of_study: student.fields_of_study.join(", "),
    assigned_subjects: assignedSubjects.join(", "),
    student_location: `${student.city}, ${student.country}`,
    hours_per_week: student.hours_per_week_needed,
    preferred_language: student.preferred_language,
    match_score: match.score
  }
}
```

#### Admin Email Workflow:
1. **Select match from suggestions**
2. **Choose email template**
3. **Preview with auto-filled variables**
4. **Optional: Edit template content**
5. **Send to volunteer**
6. **Track email status and response**

### 7. Advanced Admin Dashboard with Assignment Tracking

#### Main Views:

##### 1. Student Overview with Subject Status:
```javascript
// Student list with subject assignment status
{
  students: [
    {
      id: "student_1",
      name: "Ahmed Hassan",
      cause: "Gaza",
      fields: ["Computer Science", "Mathematics"],
      subjects: {
        total: 5,
        assigned: 3,
        unassigned: 2,
        details: [
          { keyword: "Python", status: "assigned", volunteer: "John Smith" },
          { keyword: "Calculus", status: "unassigned" }
        ]
      },
      matchCount: 2,
      status: "Partially Matched"
    }
  ]
}
```

##### 2. Smart Matching Grid:
- **Auto-suggestions for new students**
- **Filter by availability only**
- **Score-based sorting**
- **Capacity indicators**
- **Quick assignment actions**

##### 3. Email Management Center:
- **Template library**
- **Sent emails tracking**
- **Response monitoring**
- **Automated follow-ups**

### 8. Real-Time Updates and Notifications

#### WebSocket Events:
```javascript
// Real-time events
socket.on('new_student_registered', (data) => {
  // Trigger automatic matching
  // Update admin dashboard
  // Show notification
});

socket.on('volunteer_capacity_changed', (data) => {
  // Update availability status
  // Recalculate potential matches
  // Notify admin if new slots open
});

socket.on('subject_assigned', (data) => {
  // Update student subject status
  // Update volunteer workload
  // Refresh UI
});
```

### 9. Matching Algorithm (Simplified)

```python
def calculate_match_score(volunteer, student):
    """
    Simplified matching focused on availability and field match
    """
    # MANDATORY: Same cause and field overlap
    if volunteer.cause != student.cause:
        return 0
    
    field_overlap = set(volunteer.fields) & set(student.fields)
    if not field_overlap:
        return 0
    
    # Check availability
    if volunteer.current_capacity >= volunteer.max_capacity:
        return 0  # Don't suggest if full
    
    score = 0
    reasons = []
    
    # Field match (40 points)
    score += 40
    reasons.append(f"Field match: {', '.join(field_overlap)}")
    
    # Subject keyword similarity (30 points)
    keyword_matches = 0
    for student_kw in student.topics_need_support:
        for volunteer_kw in volunteer.subjects_qualified:
            if similar_keywords(student_kw, volunteer_kw):
                keyword_matches += 1
    
    score += min(30, keyword_matches * 10)
    if keyword_matches > 0:
        reasons.append(f"{keyword_matches} subject matches")
    
    # Language match (20 points)
    if volunteer.preferred_language == student.preferred_language:
        score += 20
        reasons.append("Language match")
    
    # Hours availability (10 points)
    hours_ratio = min(1, volunteer.hours_available / student.hours_needed)
    score += hours_ratio * 10
    reasons.append(f"Hours availability: {hours_ratio:.0%}")
    
    return {
        'score': score,
        'reasons': reasons,
        'available_capacity': volunteer.max_capacity - volunteer.current_capacity
    }
```

### 10. Progress Tracking with Subject Focus

#### Per-Subject Progress:
```javascript
// Track progress for each assigned subject
{
  match: {
    student: "Ahmed Hassan",
    volunteer: "John Smith",
    assignedSubjects: ["Python", "Data Structures"],
    progress: {
      "Python": {
        sessionsCompleted: 5,
        topicsCovered: ["Variables", "Loops", "Functions"],
        proficiencyLevel: "Intermediate",
        nextTopics: ["Classes", "File I/O"]
      },
      "Data Structures": {
        sessionsCompleted: 3,
        topicsCovered: ["Arrays", "Linked Lists"],
        proficiencyLevel: "Beginner",
        nextTopics: ["Stacks", "Queues"]
      }
    }
  }
}
```

---

## 🔄 User Flows

### Admin Flow:
```
Login → Dashboard → View Auto-Suggested Matches (from triggers)
    ↓
Select Student → View Subject Keywords Status
    ↓
Review Available Volunteers (with capacity) → Select Best Matches
    ↓
Assign Specific Subjects to Each Volunteer
    ↓
Choose Email Template → Preview → Send to Volunteer
    ↓
Track Email Response:
    - If Accepted: Activate Match + Update Subject Status
    - If Rejected: Mark Reason + Find Alternative
    - If Incompatible: Mark "Not Compatible"
    ↓
Monitor Active Matches → Track Subject Coverage
```

### Volunteer Flow:
```
Register → Set Up to 10 Free-Text Subjects → Set Capacity
    ↓
Wait for Admin Assignment (No Browsing)
    ↓
Receive Email with Student Details → Review in Dashboard
    ↓
Accept/Reject Match Request
    ↓
If Accepted → Access Only Assigned Student(s)
    ↓
View Assigned Subjects Only → Begin Teaching
    ↓
Track Progress → Provide Feedback
    ↓
Update Capacity if Needed (Unless Admin-Locked)
```

### Student Flow:
```
Register → Add Up to 10 Free-Text Topics → Submit
    ↓
System Auto-Triggers Matching → Admin Reviews
    ↓
Wait for Admin Assignment
    ↓
Receive Notification: Some/All Subjects Assigned
    ↓
View Assigned Volunteers → See Subject Coverage:
    - ✅ Assigned Subjects (with volunteer name)
    - ❌ Unassigned Subjects (waiting)
    ↓
Start Learning with Assigned Volunteers
    ↓
Track Progress per Subject → Provide Feedback
```

### Automatic System Triggers:
```
New Student Registration:
    ↓
System Finds Volunteers with:
    - Same Cause ✓
    - Same Field(s) ✓ 
    - Available Capacity ✓
    ↓
Calculate Match Scores → Store as "auto_suggested"
    ↓
Notify Admin: "New matches available for review"

Volunteer Capacity Change:
    ↓
If Capacity Opens → Find Unmatched Students
    ↓
Generate New Suggestions → Notify Admin
```

---

## 💻 Technical Stack

### Frontend:
- **Framework:** Next.js 14 with TypeScript
- **UI Library:** Tailwind CSS + Shadcn/ui
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Data Fetching:** TanStack Query
- **Charts:** Recharts for analytics
- **Tag Input:** Custom component with autocomplete
- **Tables:** TanStack Table for admin grids

### Backend:
- **Framework:** Node.js with NestJS (for better modularity)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Vector Database:** Pinecone or Weaviate for semantic search
- **Caching:** Redis for match scores
- **Authentication:** JWT with refresh tokens
- **Email:** SendGrid or AWS SES
- **Queue System:** Bull Queue for background jobs
- **NLP Service:** OpenAI Embeddings API or Sentence Transformers

### AI/ML Services:
- **Embeddings:** OpenAI text-embedding-ada-002 or Sentence-BERT
- **Semantic Search:** Pinecone/Weaviate vector database
- **Field Relationship:** Custom knowledge graph

### DevOps:
- **Hosting:** Vercel (Frontend) + Railway/Render (Backend)
- **Database:** Supabase with pgvector extension
- **Monitoring:** Sentry for error tracking
- **Analytics:** Mixpanel for user behavior
- **CI/CD:** GitHub Actions
- **Background Jobs:** Redis + Bull Queue

---

## 📦 Development Modules

### Module 1: Authentication & User Management
```bash
# Prompt for Claude CLI:
Create a complete authentication system using Next.js 14, TypeScript, and Prisma with PostgreSQL. 
Include:
- JWT authentication with refresh tokens
- Email verification flow  
- Password reset functionality
- Role-based access control (admin, volunteer, student)
- User profile CRUD operations
- Session management with Redis
- Role-specific route protection
- Volunteer access restrictions (can only see assigned students)
Use Tailwind CSS and Shadcn/ui for styling.
```

### Module 2: Free-Text Subject Registration
```bash
# Prompt for Claude CLI:
Create registration forms with free-text subject input:

Key Features:
1. Free-Text Subject Input (NOT dropdown):
   - Allow ANY text input for subjects/topics
   - Up to 10 keywords maximum
   - Press Enter to add keyword
   - Visual tag display with remove option
   - No autocomplete or suggestions needed
   - Store as simple text array

2. Volunteer Registration:
   - Basic info fields
   - Location (city, country, area)
   - Single cause selection (Gaza, Ukraine, etc.)
   - Multiple field selection from 200+ predefined list
   - Free-text subjects (up to 10)
   - Hours per week available
   - Max student capacity

3. Student Registration:
   - Basic info with gender
   - Location with area
   - Single cause selection
   - Multiple fields from predefined list
   - Free-text topics needing help (up to 10)
   - Store with status: {keyword: string, status: 'unassigned'}
   - Hours per week needed

Include validation, error handling, and clean UI.
```

### Module 3: Automatic Matching Triggers
```bash
# Prompt for Claude CLI:
Implement automatic matching system with triggers:

1. New Student Trigger:
   - On registration completion, find all volunteers with:
     * Same cause (mandatory)
     * At least one overlapping field
     * Available capacity (current < max)
   - Calculate simple match scores
   - Store all matches as 'auto_suggested' status
   - Notify admin via dashboard and email

2. Capacity Change Trigger:
   - When volunteer updates capacity or admin changes it
   - If slots open, find unmatched students
   - Generate new suggestions
   - Update availability status

3. Match Score Calculation (Simplified):
   - Field overlap: 40 points
   - Subject keyword similarity: 30 points (simple text matching)
   - Language match: 20 points
   - Hours compatibility: 10 points
   - Show ALL scores, even if low

4. Background Jobs:
   - Use Bull Queue for async processing
   - Process triggers within 30 seconds
   - Cache results for 1 hour
   - Handle failures with retry logic

No semantic/AI matching needed - just text comparison.
```

### Module 4: Admin Dashboard with Subject Assignment
```bash
# Prompt for Claude CLI:
Create admin dashboard with subject assignment management:

1. Subject Assignment Interface:
   - Student view showing all topics with status:
     * Green = Assigned (show volunteer name)
     * Red = Unassigned
   - Assign/unassign subjects to specific volunteers
   - Bulk assignment options
   - Track assignment history
   
2. Match Management:
   - View auto-suggested matches from triggers
   - Filter by: cause, field, status, capacity
   - See available volunteers only (not full)
   - Score-based sorting
   
3. Email Template System:
   - Predefined templates with variables:
     {{student_name}}, {{subjects}}, {{match_score}}
   - Template preview before sending
   - Send match request to volunteer
   - Track email status and responses
   
4. Capacity Management:
   - View/edit volunteer capacity
   - Lock capacity (prevent volunteer changes)
   - See utilization rates
   - Capacity availability indicators

5. Rejection Tracking:
   - Log rejection reasons
   - Mark as "Not Compatible" option
   - View rejection patterns
   
Use TanStack Table for grids, implement real-time updates.
```

### Module 5: Restricted Volunteer Portal
```bash
# Prompt for Claude CLI:
Create volunteer portal with restricted access:

1. Access Control:
   - Volunteers can ONLY see students assigned by admin
   - No browse functionality
   - No student list access
   - Hidden navigation to "all students"
   
2. Dashboard Features:
   - My Students section (only assigned ones)
   - For each student, show:
     * Only assigned subjects
     * Contact information  
     * Progress tracking
   - Capacity indicator (3/5 students)
   - Hours logged
   
3. Match Response:
   - Email contains match details
   - Dashboard shows pending invitations
   - Accept/Reject with reason
   - Once accepted, student appears in "My Students"
   
4. Profile Management:
   - Update subjects (up to 10 free-text)
   - Change capacity (unless admin-locked)
   - Update availability hours
   - Cannot change cause after registration

Implement strict data filtering at API level.
```

### Module 6: Student Portal with Subject Tracking
```bash
# Prompt for Claude CLI:
Create student portal with subject assignment visibility:

1. Subject Status Display:
   - List all topics submitted during registration
   - Visual indicators:
     * ✅ Assigned (show volunteer name)
     * ⏳ Pending assignment
     * ❌ Unassigned
   - Progress bar showing coverage percentage
   
2. Volunteer Access:
   - Only see volunteers assigned by admin
   - Card view for each volunteer showing:
     * Which subjects they're teaching
     * Contact details
     * Schedule
   
3. Progress Tracking:
   - Track progress per subject
   - Separate feedback for each volunteer
   - Session history by subject
   - Overall progress dashboard
   
4. Notifications:
   - Alert when new volunteer assigned
   - Subject assignment updates
   - Session reminders

Make it mobile-responsive and intuitive.
```

### Module 7: Email Integration & Templates
```bash
# Prompt for Claude CLI:
Implement email system with templates:

1. Template Management:
   - Create templates with variables
   - Default match request template:
     * Student details
     * Assigned subjects
     * Match score
     * Accept/Reject links
   
2. Email Sending:
   - SendGrid/AWS SES integration
   - Queue emails with Bull
   - Track open/click rates
   - Handle bounces
   
3. Admin Email Flow:
   - Select match from suggestions
   - Choose template
   - Preview with filled variables
   - Send to volunteer
   - Track response
   
4. Automated Emails:
   - New match notifications to admin
   - Assignment confirmations
   - Reminder emails
   - Weekly summaries

Include unsubscribe options and preferences.
```

### Module 8: Background Jobs & Real-time Updates
```bash
# Prompt for Claude CLI:
Implement background processing and real-time features:

1. Trigger Processing:
   - Queue for new student registrations
   - Queue for capacity changes  
   - Process within 30 seconds
   - Retry failed jobs (3 attempts)
   
2. Real-time Updates:
   - WebSocket with Socket.io
   - Live match score updates
   - Subject assignment changes
   - Capacity updates
   - New match notifications
   
3. Scheduled Jobs:
   - Daily: Clean expired cache
   - Weekly: Generate reports
   - Hourly: Check pending matches
   - Daily: Send reminder emails
   
4. Performance Optimization:
   - Redis caching for match scores
   - Database connection pooling
   - Query optimization with indexes
   - Pagination for large datasets

Include monitoring and error tracking with Sentry.
```

### Module 9: Analytics & Reporting
```bash
# Prompt for Claude CLI:
Create analytics dashboard and reporting:

1. Key Metrics:
   - Subject coverage rate (assigned vs unassigned)
   - Average subjects per student
   - Volunteer utilization rate
   - Match acceptance rate
   - Time to first match
   
2. Admin Analytics:
   - Subject gap analysis
   - Popular subjects trending
   - Rejection reason analysis
   - Capacity utilization charts
   - Geographic distribution
   
3. Reports:
   - Student progress by subject
   - Volunteer contribution summary
   - Weekly match summary
   - Unassigned subjects report
   
4. Data Export:
   - CSV/Excel export with filters
   - PDF report generation
   - Scheduled report emails
   
Use Recharts for visualizations, implement data aggregation.
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Users
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/:id
DELETE /api/users/:id
GET    /api/users (admin only)
```

### Volunteers
```
POST   /api/volunteers/register
GET    /api/volunteers/profile
PUT    /api/volunteers/profile
GET    /api/volunteers/capacity
PUT    /api/volunteers/capacity
PUT    /api/volunteers/teach-more-status
GET    /api/volunteers/matches
GET    /api/volunteers/students
GET    /api/volunteers/available (filter by field and cause)
POST   /api/volunteers/subjects/embed (generate embeddings)
```

### Students  
```
POST   /api/students/register
GET    /api/students/profile
PUT    /api/students/profile
GET    /api/students/matches
GET    /api/students/volunteers (all matches)
GET    /api/students/progress
GET    /api/students/unmatched (admin only)
POST   /api/students/topics/embed (generate embeddings)
```

### Matching
```
GET    /api/matches/calculate/:studentId (returns all volunteers with scores)
GET    /api/matches/student/:studentId (all matches for a student)
GET    /api/matches/volunteer/:volunteerId (all matches for a volunteer)
POST   /api/matches/create
PUT    /api/matches/:id/status
PUT    /api/matches/:id/not-compatible (admin only)
GET    /api/matches/:id
DELETE /api/matches/:id
POST   /api/matches/:id/accept
POST   /api/matches/:id/reject
GET    /api/matches/rejected (admin only)
POST   /api/matches/bulk-calculate (trigger for new user)
GET    /api/matches/scores/live (WebSocket endpoint)
```

### Sessions
```
POST   /api/sessions/schedule
GET    /api/sessions/:id
PUT    /api/sessions/:id
DELETE /api/sessions/:id
GET    /api/sessions/upcoming
GET    /api/sessions/by-match/:matchId
POST   /api/sessions/:id/complete
POST   /api/sessions/:id/cancel
GET    /api/sessions/student/:studentId (all sessions)
GET    /api/sessions/volunteer/:volunteerId (all sessions)
```

### Feedback
```
POST   /api/feedback/submit
GET    /api/feedback/match/:matchId
GET    /api/feedback/user/:userId
GET    /api/feedback/given-by/:userId
GET    /api/feedback/given-to/:userId
PUT    /api/feedback/:id
DELETE /api/feedback/:id
GET    /api/feedback/analytics
```

### Admin
```
GET    /api/admin/dashboard
GET    /api/admin/users (with advanced filters)
POST   /api/admin/users/filter
PUT    /api/admin/users/:id
GET    /api/admin/matches (with filters)
POST   /api/admin/matches/filter
POST   /api/admin/matches/bulk-create
GET    /api/admin/matches/rejected
GET    /api/admin/analytics
GET    /api/admin/reports
POST   /api/admin/causes
PUT    /api/admin/causes/:id
DELETE /api/admin/causes/:id
GET    /api/admin/capacity-overview
POST   /api/admin/export (filtered data export)
```

### Fields & Subjects
```
GET    /api/fields (all fields with relationships)
GET    /api/fields/:id
POST   /api/fields (admin only)
PUT    /api/fields/:id (admin only)
GET    /api/fields/related/:fieldId
GET    /api/subjects/suggest (autocomplete)
POST   /api/subjects/track-usage
GET    /api/subjects/popular (by field)
POST   /api/subjects/embed (generate embedding)
```

### Semantic Search
```
POST   /api/semantic/calculate-similarity
POST   /api/semantic/generate-embeddings
GET    /api/semantic/field-relationships
PUT    /api/semantic/update-relationships
POST   /api/semantic/find-similar-subjects
```

### Real-time (WebSocket)
```
WS     /ws/matches/updates (real-time score updates)
WS     /ws/notifications (user notifications)
WS     /ws/admin/dashboard (admin live updates)
```

---

## 🎨 UI/UX Specifications

### Design Principles
- **Accessibility First:** WCAG 2.1 AA compliance
- **Mobile Responsive:** Mobile-first approach
- **Intuitive Navigation:** Maximum 3 clicks to any feature
- **Clear Visual Hierarchy:** Proper use of typography and spacing
- **Consistent Design Language:** Unified color scheme and components
- **Performance Optimized:** Lazy loading, code splitting

### Color Palette
```css
:root {
  --primary: #2563eb;      /* Blue - Hope */
  --secondary: #10b981;    /* Green - Growth */
  --accent: #f59e0b;       /* Amber - Warmth */
  --danger: #ef4444;       /* Red - Alerts */
  --neutral: #6b7280;      /* Gray - Text */
  --background: #ffffff;   /* White - Clean */
  --surface: #f9fafb;      /* Light Gray - Cards */
}
```

### Key UI Components
- **Cards:** For user profiles and match suggestions
- **Tables:** For data management (sortable, filterable)
- **Forms:** Multi-step with validation
- **Modals:** For confirmations and quick actions
- **Charts:** For analytics and progress
- **Calendars:** For scheduling
- **Chat Interface:** For messaging
- **Notification Toasts:** For real-time updates

### Responsive Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

---

## 🔒 Security & Privacy

### Security Measures
1. **Authentication:**
   - JWT with short expiry (15 min access, 7 day refresh)
   - Password hashing with bcrypt (12 rounds)
   - Rate limiting on auth endpoints
   - Account lockout after failed attempts

2. **Data Protection:**
   - HTTPS everywhere
   - Input sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF tokens

3. **File Security:**
   - Virus scanning on uploads
   - File type validation
   - Size limits
   - Secure storage with access control

4. **API Security:**
   - Rate limiting
   - API key authentication for external services
   - Request validation
   - CORS configuration

### Privacy Compliance
1. **GDPR Compliance:**
   - Explicit consent for data collection
   - Right to access data
   - Right to delete account
   - Data portability
   - Privacy policy

2. **Data Minimization:**
   - Collect only necessary information
   - Automatic data cleanup
   - Anonymization for analytics

3. **Child Protection:**
   - Age verification
   - Parental consent for minors
   - Enhanced privacy for minors
   - Content moderation

---

## 📝 Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- Set up project infrastructure
- Implement authentication system
- Create database schema
- Basic user registration

### Phase 2: Core Features (Weeks 3-4)
- Complete registration forms
- Implement matching algorithm
- Create basic admin dashboard
- Set up email service

### Phase 3: User Portals (Weeks 5-6)
- Volunteer portal
- Student portal
- Profile management
- Basic messaging

### Phase 4: Matching System (Week 7)
- Automated matching
- Admin matching interface
- Match acceptance flow
- Notification system

### Phase 5: Session Management (Week 8)
- Scheduling system
- Calendar integration
- Session tracking
- Progress monitoring

### Phase 6: Feedback & Analytics (Week 9)
- Feedback system
- Rating mechanism
- Analytics dashboard
- Reporting tools

### Phase 7: Polish & Testing (Week 10)
- UI/UX improvements
- Performance optimization
- Security audit
- User testing

### Phase 8: Deployment (Week 11)
- Production setup
- Monitoring configuration
- Documentation
- Team training

### Phase 9: Post-Launch (Week 12+)
- Bug fixes
- Feature requests
- Performance monitoring
- Continuous improvement

---

## 🚦 Getting Started with Claude CLI

### Initial Setup
```bash
# 1. Create new Next.js project with TypeScript
npx create-next-app@latest academics4 --typescript --tailwind --app

# 2. Install dependencies
cd academics4
npm install prisma @prisma/client bcryptjs jsonwebtoken
npm install @hookform/resolvers react-hook-form zod
npm install @tanstack/react-query axios
npm install nodemailer @sendgrid/mail
npm install socket.io socket.io-client
npm install recharts lucide-react
npm install @radix-ui/react-* # Install needed Radix UI components

# 3. Set up Prisma
npx prisma init
# Copy the database schema from this document

# 4. Set up environment variables
# Create .env.local with necessary keys
```

### Development Workflow
```bash
# Start with Module 1: Authentication
# Copy the Module 1 prompt to Claude CLI
# Review and implement the generated code

# Continue with subsequent modules
# Test each module before proceeding to the next

# For each module:
1. Review the requirements
2. Use the provided Claude CLI prompt
3. Test the implementation
4. Integrate with existing code
5. Document any customizations
```

---

## 📚 Additional Considerations

### Scalability Planning
- Implement database indexing strategy
- Set up caching layers
- Use CDN for static assets
- Implement horizontal scaling capability
- Plan for microservices architecture if needed

### Monitoring & Maintenance
- Error tracking with Sentry
- Performance monitoring with Datadog/New Relic
- Uptime monitoring
- Regular security audits
- Automated backups

### Future Enhancements
- AI-powered content recommendations
- Mobile applications (React Native)
- Video lesson recordings library
- Gamification features
- Community forums
- Career guidance module
- Alumni network
- Integration with educational platforms
- Multi-language support (Arabic, Ukrainian, etc.)
- Offline mode capability
- WhatsApp/Telegram bot integration

### Support & Documentation
- User guides for each role
- Video tutorials
- FAQ section
- Technical documentation
- API documentation
- Troubleshooting guide
- Community support forum

---

## 🤝 Success Metrics & KPIs

### Platform Metrics
- User acquisition rate
- User retention rate (30/60/90 days)
- Match success rate (>70% acceptance)
- Average time to match (<48 hours)
- Session completion rate (>80%)
- Platform uptime (>99.9%)

### Impact Metrics
- Number of students supported
- Total volunteer hours contributed
- Average improvement in student grades
- Course completion rates
- Student satisfaction scores (>4.5/5)
- Volunteer satisfaction scores (>4.5/5)

### Operational Metrics
- Average response time (<200ms)
- Support ticket resolution time (<24 hours)
- Cost per matched pair
- Volunteer utilization rate
- Geographic coverage expansion

---

## 📧 Contact & Support

For development questions or clarifications, establish:
- Technical lead contact
- Project manager contact
- Design team contact
- Testing team contact
- Stakeholder contacts

---

## ✅ Checklist Before Launch

- [ ] Security audit completed
- [ ] GDPR compliance verified
- [ ] Performance testing done
- [ ] User acceptance testing completed
- [ ] Documentation finalized
- [ ] Backup systems tested
- [ ] Monitoring tools configured
- [ ] Support team trained
- [ ] Marketing materials ready
- [ ] Legal review completed

---

## 📎 Appendix

### Sample Matching Scenarios

#### Scenario 1: Perfect Match
- **Student:** Computer Science major, needs Python and Data Structures help, English speaker, Gaza
- **Volunteer:** Software Engineer, Python expert, online teaching experience, supports Gaza
- **Match Score:** 95/100

#### Scenario 2: Good Match
- **Student:** Pharmacy student, needs Toxicology help, Arabic speaker, Gaza
- **Volunteer:** Pharmacist, general pharmacy knowledge, Arabic speaker, supports multiple causes
- **Match Score:** 75/100

#### Scenario 3: Partial Match
- **Student:** Mechanical Engineering, needs CAD help, English speaker, Ukraine
- **Volunteer:** Civil Engineer, some CAD experience, English speaker, supports Ukraine
- **Match Score:** 60/100

---

*This document serves as a comprehensive guide for developing the Academics4 platform. Each section can be expanded into detailed specifications as needed during development.*