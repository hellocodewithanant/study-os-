import { Subject, Task, TimetableEntry, StudySession, AcademicDeadline, UserSettings } from '../types';
import { getTodayDateString, getCurrentDayOfWeek, DAYS_OF_WEEK } from '../utils/dateUtils';

// Helper to get offset date from today (offset in days, negative = past, positive = future)
function getOffsetDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-cpp',
    name: 'C++ Programming',
    code: 'CSE101',
    color: '#3B82F6', // Blue
    iconName: 'Code',
    weeklyTargetHours: 4,
    topics: [
      { id: 'top-cpp-1', name: 'Variables, Types & Operators', completed: true },
      { id: 'top-cpp-2', name: 'Control Flow & Functions', completed: true },
      { id: 'top-cpp-3', name: 'Pointers & Dynamic Memory', completed: true },
      { id: 'top-cpp-4', name: 'OOP: Classes, Encapsulation', completed: false },
      { id: 'top-cpp-5', name: 'Inheritance & Polymorphism', completed: false },
      { id: 'top-cpp-6', name: 'STL: Vectors, Maps, Sets', completed: false },
      { id: 'top-cpp-7', name: 'File Handling & Exception Handling', completed: false }
    ]
  },
  {
    id: 'sub-ai',
    name: 'Artificial Intelligence',
    code: 'CSE102',
    color: '#8B5CF6', // Purple
    iconName: 'Cpu',
    weeklyTargetHours: 3.5,
    topics: [
      { id: 'top-ai-1', name: 'Introduction to Intelligent Agents', completed: true },
      { id: 'top-ai-2', name: 'Search Algorithms (BFS, DFS, A*)', completed: true },
      { id: 'top-ai-3', name: 'Adversarial Search & Game Playing', completed: false },
      { id: 'top-ai-4', name: 'Propositional & First-Order Logic', completed: false },
      { id: 'top-ai-5', name: 'Introduction to Machine Learning', completed: false }
    ]
  },
  {
    id: 'sub-math',
    name: 'Mathematics',
    code: 'MTH101',
    color: '#EC4899', // Pink
    iconName: 'Sigma',
    weeklyTargetHours: 4,
    topics: [
      { id: 'top-math-1', name: 'Linear Algebra: Matrices & Determinants', completed: true },
      { id: 'top-math-2', name: 'Eigenvalues & Eigenvectors', completed: true },
      { id: 'top-math-3', name: 'Multivariable Calculus: Partial Derivatives', completed: true },
      { id: 'top-math-4', name: 'Multiple Integrals & Vector Calculus', completed: false },
      { id: 'top-math-5', name: 'Differential Equations', completed: false }
    ]
  },
  {
    id: 'sub-os',
    name: 'Operating Systems',
    code: 'CSE103',
    color: '#10B981', // Emerald
    iconName: 'Server',
    weeklyTargetHours: 3.5,
    topics: [
      { id: 'top-os-1', name: 'OS Architecture & System Calls', completed: true },
      { id: 'top-os-2', name: 'Processes & Threads Management', completed: true },
      { id: 'top-os-3', name: 'CPU Scheduling Algorithms', completed: false },
      { id: 'top-os-4', name: 'Process Synchronization & Deadlocks', completed: false },
      { id: 'top-os-5', name: 'Memory Management & Paging', completed: false },
      { id: 'top-os-6', name: 'Virtual Memory & File Systems', completed: false }
    ]
  },
  {
    id: 'sub-comm',
    name: 'Communication Skills',
    code: 'ENG101',
    color: '#F59E0B', // Amber
    iconName: 'MessageSquare',
    weeklyTargetHours: 2,
    topics: [
      { id: 'top-comm-1', name: 'Active Listening & Note Taking', completed: true },
      { id: 'top-comm-2', name: 'Technical Presentation Skills', completed: true },
      { id: 'top-comm-3', name: 'Professional Email & Report Writing', completed: false },
      { id: 'top-comm-4', name: 'Group Discussion & Interview Techniques', completed: false }
    ]
  },
  {
    id: 'sub-uiux',
    name: 'UI/UX Design',
    code: 'DES101',
    color: '#06B6D4', // Cyan
    iconName: 'Layout',
    weeklyTargetHours: 2.5,
    topics: [
      { id: 'top-uiux-1', name: 'Design Thinking & User Research', completed: true },
      { id: 'top-uiux-2', name: 'Wireframing & Low-Fidelity Prototyping', completed: true },
      { id: 'top-uiux-3', name: 'Typography, Color Theory & Spacing', completed: false },
      { id: 'top-uiux-4', name: 'Component Systems & Design Tokens', completed: false },
      { id: 'top-uiux-5', name: 'Usability Testing & Accessibility (WCAG)', completed: false }
    ]
  },
  {
    id: 'sub-tech',
    name: 'Technical Skills',
    code: 'CSE104',
    color: '#6366F1', // Indigo
    iconName: 'Terminal',
    weeklyTargetHours: 3,
    topics: [
      { id: 'top-tech-1', name: 'Git & GitHub Version Control', completed: true },
      { id: 'top-tech-2', name: 'Linux Command Line & Bash Scripting', completed: true },
      { id: 'top-tech-3', name: 'Markdown Documentation & Static Sites', completed: false },
      { id: 'top-tech-4', name: 'Basic Web Concepts (HTTP, APIs, JSON)', completed: false }
    ]
  },
  {
    id: 'sub-apt',
    name: 'Aptitude',
    code: 'APT101',
    color: '#14B8A6', // Teal
    iconName: 'Zap',
    weeklyTargetHours: 2,
    topics: [
      { id: 'top-apt-1', name: 'Quantitative: Ratios, Percentages, Time & Work', completed: true },
      { id: 'top-apt-2', name: 'Logical Reasoning & Syllogisms', completed: true },
      { id: 'top-apt-3', name: 'Data Interpretation & Graph Analysis', completed: false },
      { id: 'top-apt-4', name: 'Permutations, Combinations & Probability', completed: false }
    ]
  },
  {
    id: 'sub-soft',
    name: 'Soft Skills',
    code: 'HSS101',
    color: '#84CC16', // Lime
    iconName: 'Smile',
    weeklyTargetHours: 1.5,
    topics: [
      { id: 'top-soft-1', name: 'Time Management & Deep Work Habits', completed: true },
      { id: 'top-soft-2', name: 'Conflict Resolution & Teamwork', completed: true },
      { id: 'top-soft-3', name: 'Leadership & Ethical Decision Making', completed: false }
    ]
  }
];

export function getInitialTasks(): Task[] {
  const today = getTodayDateString();
  return [
    {
      id: 'tsk-1',
      title: 'Practice C++ Pointer Arithmetic exercises',
      description: 'Solve questions 12-25 from Chapter 4 on double pointers and memory allocation',
      subjectId: 'sub-cpp',
      category: 'Daily Study',
      dueDate: today,
      dueTime: '17:30',
      priority: 'High',
      status: 'Completed',
      estimatedMinutes: 60,
      completedAt: `${today}T15:30:00.000Z`
    },
    {
      id: 'tsk-2',
      title: 'Review A* Search Algorithm lecture slides',
      description: 'Prepare notes on admissible and consistent heuristics for the upcoming quiz',
      subjectId: 'sub-ai',
      category: 'Revision',
      dueDate: today,
      dueTime: '19:00',
      priority: 'Medium',
      status: 'Pending',
      estimatedMinutes: 45
    },
    {
      id: 'tsk-3',
      title: 'Solve Eigenvalues & Eigenvectors worksheet',
      description: 'Complete problems 1 to 8 on diagonalizing 3x3 matrices',
      subjectId: 'sub-math',
      category: 'Assignment',
      dueDate: today,
      dueTime: '21:00',
      priority: 'High',
      status: 'In Progress',
      estimatedMinutes: 75
    },
    {
      id: 'tsk-4',
      title: 'Compile OS Process Scheduling simulator in C',
      description: 'Implement FCFS and Round Robin algorithm with time quantum 4',
      subjectId: 'sub-os',
      category: 'Practical or Lab',
      dueDate: getOffsetDate(1),
      dueTime: '16:00',
      priority: 'High',
      status: 'Pending',
      estimatedMinutes: 90
    },
    {
      id: 'tsk-5',
      title: 'Create wireframes for Campus Food Delivery app',
      description: 'Draft low-fidelity Figma screens: browse, cart, checkout',
      subjectId: 'sub-uiux',
      category: 'Daily Study',
      dueDate: getOffsetDate(2),
      dueTime: '18:00',
      priority: 'Medium',
      status: 'Pending',
      estimatedMinutes: 60
    },
    {
      id: 'tsk-6',
      title: 'Review Git Branching & Merge Conflicts guide',
      description: 'Simulate 3-way merge conflict locally and resolve it',
      subjectId: 'sub-tech',
      category: 'Daily Study',
      dueDate: getOffsetDate(-1),
      dueTime: '18:00',
      priority: 'Low',
      status: 'Completed',
      estimatedMinutes: 30,
      completedAt: `${getOffsetDate(-1)}T17:00:00.000Z`
    },
    {
      id: 'tsk-7',
      title: 'Aptitude: Solve 20 Time & Work questions',
      description: 'Speed drill with timer, aim for under 2 minutes per question',
      subjectId: 'sub-apt',
      category: 'Daily Study',
      dueDate: getOffsetDate(3),
      dueTime: '20:00',
      priority: 'Medium',
      status: 'Pending',
      estimatedMinutes: 40
    }
  ];
}

export const INITIAL_TIMETABLE: TimetableEntry[] = [
  // Monday
  {
    id: 'tt-mon-1',
    subjectId: 'sub-math',
    topic: 'Eigenvalues & Characteristic Equation',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    location: 'LHC Room 102',
    completed: true
  },
  {
    id: 'tt-mon-2',
    subjectId: 'sub-cpp',
    topic: 'Pointers & Dynamic Memory Allocation',
    dayOfWeek: 'Monday',
    startTime: '10:45',
    endTime: '12:15',
    location: 'CSE Lab 3',
    completed: true
  },
  {
    id: 'tt-mon-3',
    subjectId: 'sub-comm',
    topic: 'Presentation Skills & Impromptu Speaking',
    dayOfWeek: 'Monday',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Seminar Hall B',
    completed: true
  },

  // Tuesday
  {
    id: 'tt-tue-1',
    subjectId: 'sub-os',
    topic: 'Process States & PCB Structure',
    dayOfWeek: 'Tuesday',
    startTime: '09:00',
    endTime: '10:30',
    location: 'LHC Room 204',
    completed: true
  },
  {
    id: 'tt-tue-2',
    subjectId: 'sub-ai',
    topic: 'Uninformed Search: BFS vs DFS',
    dayOfWeek: 'Tuesday',
    startTime: '10:45',
    endTime: '12:15',
    location: 'LHC Room 204',
    completed: true
  },
  {
    id: 'tt-tue-3',
    subjectId: 'sub-tech',
    topic: 'Linux Shell Scripting Hands-on',
    dayOfWeek: 'Tuesday',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Systems Lab 1',
    completed: true
  },

  // Wednesday
  {
    id: 'tt-wed-1',
    subjectId: 'sub-cpp',
    topic: 'OOP: Constructors & Destructors',
    dayOfWeek: 'Wednesday',
    startTime: '09:00',
    endTime: '10:30',
    location: 'CSE Lab 3',
    completed: false
  },
  {
    id: 'tt-wed-2',
    subjectId: 'sub-math',
    topic: 'Partial Derivatives & Chain Rule',
    dayOfWeek: 'Wednesday',
    startTime: '10:45',
    endTime: '12:15',
    location: 'LHC Room 102',
    completed: false
  },
  {
    id: 'tt-wed-3',
    subjectId: 'sub-uiux',
    topic: 'Figma Auto-Layout & Design Components',
    dayOfWeek: 'Wednesday',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Design Studio A',
    completed: false
  },

  // Thursday
  {
    id: 'tt-thu-1',
    subjectId: 'sub-os',
    topic: 'CPU Scheduling: FCFS, SJF, Round Robin',
    dayOfWeek: 'Thursday',
    startTime: '09:00',
    endTime: '10:30',
    location: 'LHC Room 204',
    completed: false
  },
  {
    id: 'tt-thu-2',
    subjectId: 'sub-ai',
    topic: 'A* Search Heuristics & Consistency',
    dayOfWeek: 'Thursday',
    startTime: '10:45',
    endTime: '12:15',
    location: 'LHC Room 204',
    completed: false
  },
  {
    id: 'tt-thu-3',
    subjectId: 'sub-apt',
    topic: 'Quantitative Aptitude: Speed Drills',
    dayOfWeek: 'Thursday',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Auditorium 2',
    completed: false
  },

  // Friday
  {
    id: 'tt-fri-1',
    subjectId: 'sub-cpp',
    topic: 'Operator Overloading & Friend Functions',
    dayOfWeek: 'Friday',
    startTime: '09:00',
    endTime: '11:00',
    location: 'Programming Lab 2',
    completed: false
  },
  {
    id: 'tt-fri-2',
    subjectId: 'sub-soft',
    topic: 'Effective Team Collaboration & Ethics',
    dayOfWeek: 'Friday',
    startTime: '11:15',
    endTime: '12:45',
    location: 'Seminar Room 1',
    completed: false
  },
  {
    id: 'tt-fri-3',
    subjectId: 'sub-tech',
    topic: 'Git Collaborative Workflow & Pull Requests',
    dayOfWeek: 'Friday',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Systems Lab 1',
    completed: false
  },

  // Saturday
  {
    id: 'tt-sat-1',
    subjectId: 'sub-math',
    topic: 'Problem Solving & Tutorial Session',
    dayOfWeek: 'Saturday',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Tutorial Hall 3',
    completed: false
  },
  {
    id: 'tt-sat-2',
    subjectId: 'sub-ai',
    topic: 'Mini-Project Mentoring & Discussion',
    dayOfWeek: 'Saturday',
    startTime: '14:00',
    endTime: '16:00',
    location: 'AI Research Lab',
    completed: false
  },

  // Sunday
  {
    id: 'tt-sun-1',
    subjectId: 'sub-soft',
    topic: 'Weekly Review & Self-Reflection',
    dayOfWeek: 'Sunday',
    startTime: '11:00',
    endTime: '12:30',
    location: 'Home Study Space',
    completed: false
  }
];

export function getInitialStudySessions(): StudySession[] {
  const today = getTodayDateString();
  return [
    {
      id: 'sess-1',
      subjectId: 'sub-cpp',
      topic: 'Pointer Arithmetic & Memory Leaks in C++',
      startTime: `${today}T14:00:00.000Z`,
      endTime: `${today}T15:15:00.000Z`,
      durationMinutes: 75,
      date: today,
      notes: 'Practiced allocation with new/delete, checked valgrind leak behavior.'
    },
    {
      id: 'sess-2',
      subjectId: 'sub-math',
      topic: 'Eigenvalue Calculation for 3x3 Matrices',
      startTime: `${today}T16:00:00.000Z`,
      endTime: `${today}T16:50:00.000Z`,
      durationMinutes: 50,
      date: today,
      notes: 'Worked on characteristic polynomials and determinant expansions.'
    },
    {
      id: 'sess-3',
      subjectId: 'sub-os',
      topic: 'Process Scheduling algorithms comparison',
      startTime: `${getOffsetDate(-1)}T10:00:00.000Z`,
      endTime: `${getOffsetDate(-1)}T11:30:00.000Z`,
      durationMinutes: 90,
      date: getOffsetDate(-1),
      notes: 'Drew Gantt charts for preemptive SJF and priority scheduling.'
    },
    {
      id: 'sess-4',
      subjectId: 'sub-ai',
      topic: 'Breadth-First Search & Depth-First Search',
      startTime: `${getOffsetDate(-2)}T15:00:00.000Z`,
      endTime: `${getOffsetDate(-2)}T16:20:00.000Z`,
      durationMinutes: 80,
      date: getOffsetDate(-2),
      notes: 'Understood time and space complexity comparison.'
    },
    {
      id: 'sess-5',
      subjectId: 'sub-uiux',
      topic: 'Design principles & Wireframing',
      startTime: `${getOffsetDate(-3)}T11:00:00.000Z`,
      endTime: `${getOffsetDate(-3)}T12:00:00.000Z`,
      durationMinutes: 60,
      date: getOffsetDate(-3),
      notes: 'Researched mobile visual hierarchy and contrast ratios.'
    },
    {
      id: 'sess-6',
      subjectId: 'sub-tech',
      topic: 'Git branching and merge conflict resolution',
      startTime: `${getOffsetDate(-4)}T17:00:00.000Z`,
      endTime: `${getOffsetDate(-4)}T18:00:00.000Z`,
      durationMinutes: 60,
      date: getOffsetDate(-4),
      notes: 'Practiced rebase vs merge commands in terminal.'
    }
  ];
}

export function getInitialDeadlines(): AcademicDeadline[] {
  const today = getTodayDateString();
  return [
    {
      id: 'dead-1',
      title: 'Mathematics Assignment 3: Matrix Transformations',
      subjectId: 'sub-math',
      type: 'Assignment',
      dueDate: today,
      dueTime: '23:59',
      status: 'In Progress',
      priority: 'High',
      notes: 'Submit handwritten solutions as a single scanned PDF on the university portal.'
    },
    {
      id: 'dead-2',
      title: 'C++ Programming Lab Practical 2',
      subjectId: 'sub-cpp',
      type: 'Practical',
      dueDate: getOffsetDate(2),
      dueTime: '14:00',
      status: 'Pending',
      priority: 'High',
      notes: 'Bring lab observation notebook with verified outputs for sessions 4-7.'
    },
    {
      id: 'dead-3',
      title: 'Operating Systems Internal Test 1',
      subjectId: 'sub-os',
      type: 'Internal Test',
      dueDate: getOffsetDate(5),
      dueTime: '10:00',
      status: 'Pending',
      priority: 'High',
      notes: 'Syllabus: Chapters 1 to 3 (Introduction, System Calls, Processes, CPU Scheduling).'
    },
    {
      id: 'dead-4',
      title: 'Communication Skills Impromptu Presentation Viva',
      subjectId: 'sub-comm',
      type: 'Viva',
      dueDate: getOffsetDate(8),
      dueTime: '11:30',
      status: 'Pending',
      priority: 'Medium',
      notes: 'Topic will be allotted on the spot; 3 minutes speaking time.'
    },
    {
      id: 'dead-5',
      title: 'UI/UX Interactive Prototype Evaluation',
      subjectId: 'sub-uiux',
      type: 'Assignment',
      dueDate: getOffsetDate(12),
      dueTime: '18:00',
      status: 'Pending',
      priority: 'Medium',
      notes: 'Share Figma prototype link with interactive user flows.'
    },
    {
      id: 'dead-6',
      title: 'Mid-Semester Examinations',
      subjectId: 'sub-ai',
      type: 'Examination',
      dueDate: getOffsetDate(20),
      dueTime: '09:30',
      status: 'Pending',
      priority: 'High',
      notes: 'Theory examination covering first 3 units of all major subjects.'
    }
  ];
}

export const INITIAL_SETTINGS: UserSettings = {
  studentName: 'Yash Sharma',
  program: 'B.Tech Computer Science & Engineering',
  semester: 'Semester 1',
  dailyTargetMinutes: 180, // 3 hours daily target
  weeklyTargetHours: 20,   // 20 hours weekly target
  theme: 'light',
  defaultView: 'dashboard',
  weekStart: 'Monday',
  subjectColors: {},
  breakReminderMinutes: 45
};
