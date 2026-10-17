# StudyOS — Interactive Student Productivity Dashboard

> **"Plan Better. Study Smarter. Track Your Progress."**

StudyOS is a responsive, interactive, and modern productivity dashboard designed specifically for first-year B.Tech Computer Science and Engineering students. It provides a complete environment to track daily study tasks, syllabus milestones, weekly timetable entries, live stopwatch study sessions, academic deadlines, and productivity analytics.

---

## 🚀 Key Features

### 1. 📊 Centralized Dashboard
- **Personalized Dynamic Greeting:** Greets the student based on local time of day (*Good morning / afternoon / evening / Working late, Yash!*).
- **Live Summary Metric Cards:** Real-time metrics computed directly from stored data:
  - Today's Tasks
  - Tasks Completed
  - Study Time Today
  - Weekly Study Goal
  - Active Subjects in Progress
  - Upcoming Academic Deadlines
- **Daily Focus Score:** Weighted daily productivity score combining task completion (60%) and study goal fulfillment (40%).
- **Chronological Today's Schedule:** Direct lecture and lab session timeline with instant completion checkboxes.
- **Interactive Tasks Checklist:** Check off today's tasks with immediate progress updates.
- **Weekly Study Trend:** Integrated Recharts bar chart displaying study hours for every day of the current week.

### 2. ✅ My Tasks
- **Full Lifecycle Management:** Create, edit, delete, complete, and reopen tasks.
- **Categorization & Priority:** Categorize by *Daily Study, Assignment, Practical or Lab, Revision, Exam Preparation, or Personal*, with *Low, Medium, or High* priority badges.
- **Overdue Detection:** Tasks past due date are highlighted with an overdue warning (e.g., *"Overdue by 2 days"*).
- **Filtering & Search:** Real-time search by task title or description; filters by status, subject, priority, and category; sorting by due date or priority.
- **Safe Destructive Confirmations:** Modal prompt before deleting any task.

### 3. 📚 Academic Subjects & Syllabus Milestones
- **9 Preloaded Core Subjects:**
  1. C++ Programming (`CSE101`)
  2. Artificial Intelligence (`CSE102`)
  3. Mathematics (`MTH101`)
  4. Operating Systems (`CSE103`)
  5. Communication Skills (`ENG101`)
  6. UI/UX Design (`DES101`)
  7. Technical Skills (`CSE104`)
  8. Aptitude (`APT101`)
  9. Soft Skills (`HSS101`)
- **Independent Metrics:** Syllabus topic completion (checkboxes) and logged study time remain separate metrics.
- **Detailed Subject Modal:** Full topic syllabus checklist (add, rename, toggle, delete topics), related tasks, associated deadlines, and past study sessions.
- **Subject Customization:** Edit subject names, course codes, weekly target hours, and theme colors.

### 4. 📅 Weekly Timetable
- **7-Day Schedule (Monday to Sunday):** Chronological lecture, lab, and tutorial slots with room locations and notes.
- **Desktop & Mobile Optimized Layouts:**
  - Desktop: Full 7-column responsive grid with subject color indicators and hover actions.
  - Mobile: Day selector tab bar to prevent horizontal screen squeezing.
- **Overlap Prevention & Validation:** Warns about overlapping timetable entries and prevents invalid time ranges where end time is before start time.
- **Completion Check:** Toggle whether a class session was attended.

### 5. ⏱️ Study Session Tracker
- **Drift-Free Precision Stopwatch:** Built using high-precision timestamp calculations to avoid interval drift.
- **Controls:** Start, Pause, Resume, Stop, and Reset.
- **Live Header Badge:** Running timer displays in the global application header with pulsing indicator across all views.
- **Session Logging:** Stopping prompts to save duration (in minutes), topic covered, date, and reflections/notes.
- **Target Tracking:** Daily targets in minutes and weekly targets in hours with real-time percentage bars.
- **Session History:** Review and delete logged sessions.

### 6. 🎓 Academic Deadlines & Examinations
- **Assessment Types:** *Assignment, Practical, Internal Test, Viva, Examination*.
- **Accurate Countdowns:** Highlights *"Due today"*, *"Due tomorrow"*, *"Due in X days"*, or *"Overdue by X days"* (no negative countdowns).
- **Multi-Filter Support:** Filter by assessment type, subject, and status.

### 7. 📈 Analytics & Reports
- **Weekly Study Hours Chart:** Day-by-day distribution for the current week.
- **Subject Time Distribution:** Interactive donut chart comparing study time across subjects.
- **Topic Coverage Breakdown:** Stacked bar chart showing completed vs remaining syllabus topics per subject.
- **Key Performance Indicators:** Most-studied subject, weekly goal achievement rate, and total lifetime study hours.

### 8. ⚙️ Settings, Theme & Data Persistence
- **Personalization:** Edit student name, degree program, semester, daily/weekly targets, and week start preference.
- **Light & Dark Theme:** Instant theme toggle with full persistence across page refreshes.
- **JSON Backup & Restore:** Export complete student data as JSON and import backups with validation and record previews.
- **Sample Data Reset:** Reset button with confirmation to restore initial CSE dataset.

---

## 🛠️ Technology Stack

- **Frontend:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (configured with dark mode and curated color palette)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Storage:** Browser LocalStorage (with data export/import capabilities)

---

## 💾 Where Data Is Stored

All StudyOS user data is persisted locally in the user's browser using **HTML5 LocalStorage** under the following keys:
- `studyos_subjects_v1`
- `studyos_tasks_v1`
- `studyos_timetable_v1`
- `studyos_sessions_v1`
- `studyos_deadlines_v1`
- `studyos_settings_v1`

> **Note:** Data is private and stored directly on your device without transmitting to any remote cloud servers. To transfer data across devices, use the **Export Data (JSON)** feature in the Settings page.

---

## 🏁 Getting Started

### Prerequisites
- Node.js (version 18+ recommended)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<YOUR_GITHUB_USERNAME>/study-os.git

# 2. Navigate into the project folder
cd study-os

# 3. Install dependencies
npm install
```

### Running Locally

```bash
# Start the Vite development server
npm run dev
```

Open your browser at:
`http://localhost:5173/`

### Building for Production

```bash
npm run build
```

The production bundle will be generated in the `dist/` directory.

---

## 🧪 Testing Checklist

- [x] **Dashboard:** Greeting updates with time of day; metric cards calculate from real data; daily focus percentage updates dynamically when tasks are toggled.
- [x] **Tasks:** Add, edit, delete tasks; toggle completion; test search and priority/status filters; verify overdue badge calculation.
- [x] **Subjects:** Click subject cards to view topics checklist; add, rename, or check off topics; verify that syllabus progress updates independently of study hours.
- [x] **Timetable:** Add and edit lecture slots; test time validation (end time before start time); test mobile day tab selector.
- [x] **Study Tracker:** Start timer; pause and resume; verify elapsed time in header chip; click "Stop & Save" and save the record; verify that the new session updates dashboard and analytics.
- [x] **Assignments & Deadlines:** Check countdown badges ("Due in X days", "Overdue by X days"); filter by assessment type.
- [x] **Analytics:** Verify bar charts and donut charts render accurately with tooltips.
- [x] **Settings & Persistence:** Toggle dark mode; change daily target; export backup JSON; refresh the browser to verify data survives reload.
