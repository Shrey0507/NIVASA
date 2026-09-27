// NIVASA Admin Dashboard - Mock Data Layer
// ⚠️ This is demo data for development. Real data should come from backend/Supabase.

// Helper function to generate dates
const getDate = (daysOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const getDateTime = (daysOffset, hours = 10) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

// Statistics for Dashboard
export const dashboardStats = {
  totalStudents: 342,
  roomOccupancy: {
    occupied: 308,
    total: 360,
    percentage: 85.6
  },
  pendingFees: 145000,
  openGrievances: 12
};

// Occupancy data by floor and block
export const occupancyData = {
  boys: {
    1: { A: { occupied: 18, total: 20 }, B: { occupied: 20, total: 20 }, C: { occupied: 19, total: 20 } },
    2: { A: { occupied: 20, total: 20 }, B: { occupied: 18, total: 20 }, C: { occupied: 20, total: 20 } },
    3: { A: { occupied: 17, total: 20 }, B: { occupied: 20, total: 20 }, C: { occupied: 18, total: 20 } },
    4: { A: { occupied: 19, total: 20 }, B: { occupied: 20, total: 20 }, C: { occupied: 16, total: 20 } }
  },
  girls: {
    1: { A: { occupied: 16, total: 20 }, B: { occupied: 18, total: 20 }, C: { occupied: 20, total: 20 } },
    2: { A: { occupied: 20, total: 20 }, B: { occupied: 19, total: 20 }, C: { occupied: 17, total: 20 } },
    3: { A: { occupied: 18, total: 20 }, B: { occupied: 20, total: 20 }, C: { occupied: 20, total: 20 } },
    4: { A: { occupied: 15, total: 20 }, B: { occupied: 16, total: 20 }, C: { occupied: 14, total: 20 } }
  }
};

// Recent activity
export const recentActivity = [
  {
    id: 1,
    type: 'registration',
    message: 'New student registration: Priya Sharma (1MS22CS089)',
    timestamp: getDateTime(-1, 14)
  },
  {
    id: 2,
    type: 'allocation',
    message: 'Room allocated: B-204 to Rahul Kumar',
    timestamp: getDateTime(-1, 11)
  },
  {
    id: 3,
    type: 'fee',
    message: 'Fee payment recorded: ₹45,000 by Ananya Desai',
    timestamp: getDateTime(-2, 16)
  },
  {
    id: 4,
    type: 'movement',
    message: 'Check-out recorded: Vikram Singh (Expected return: ' + getDate(0) + ')',
    timestamp: getDateTime(-3, 10)
  },
  {
    id: 5,
    type: 'grievance',
    message: 'New grievance submitted: WiFi connectivity issue',
    timestamp: getDateTime(-3, 15)
  }
];

// Pending actions
export const pendingActions = {
  openGrievances: [
    { id: 1, student: 'Aditya Patil', issue: 'WiFi connectivity issue', days: 2 },
    { id: 2, student: 'Sneha Reddy', issue: 'Room maintenance required', days: 4 },
    { id: 3, student: 'Karan Mehta', issue: 'Mess food quality', days: 1 }
  ],
  overdueFees: [
    { id: 1, student: 'Rajesh Kumar', usn: '1MS22CS045', amount: 45000, dueDate: getDate(-15) },
    { id: 2, student: 'Divya Iyer', usn: '1MS22EC023', amount: 45000, dueDate: getDate(-8) }
  ],
  pendingReturns: [
    { id: 1, student: 'Arjun Nair', usn: '1MS22ME015', expectedReturn: getDate(-2) }
  ]
};

// Students
export const students = [
  {
    id: 1,
    fullName: 'Aarav Kumar',
    usn: '1MS22CS001',
    department: 'Computer Science',
    class: '3rd Year',
    semester: 5,
    email: 'aarav.kumar@sjbit.edu.in',
    phone: '9876543210',
    guardianName: 'Rajesh Kumar',
    guardianPhone: '9876543211',
    hostelType: 'boys',
    room: 'B-101',
    floor: 1,
    block: 'B',
    status: 'active',
    joiningDate: '2022-08-15'
  },
  {
    id: 2,
    fullName: 'Priya Sharma',
    usn: '1MS22CS089',
    department: 'Computer Science',
    class: '3rd Year',
    semester: 5,
    email: 'priya.sharma@sjbit.edu.in',
    phone: '9876543212',
    guardianName: 'Suresh Sharma',
    guardianPhone: '9876543213',
    hostelType: 'girls',
    room: 'G-201',
    floor: 2,
    block: 'A',
    status: 'active',
    joiningDate: '2022-08-15'
  },
  {
    id: 3,
    fullName: 'Rahul Verma',
    usn: '1MS22EC034',
    department: 'Electronics',
    class: '2nd Year',
    semester: 3,
    email: 'rahul.verma@sjbit.edu.in',
    phone: '9876543214',
    guardianName: 'Anil Verma',
    guardianPhone: '9876543215',
    hostelType: 'boys',
    room: 'B-204',
    floor: 2,
    block: 'B',
    status: 'active',
    joiningDate: '2023-08-15'
  },
  {
    id: 4,
    fullName: 'Ananya Desai',
    usn: '1MS22ME015',
    department: 'Mechanical',
    class: '4th Year',
    semester: 7,
    email: 'ananya.desai@sjbit.edu.in',
    phone: '9876543216',
    guardianName: 'Vikram Desai',
    guardianPhone: '9876543217',
    hostelType: 'girls',
    room: 'G-305',
    floor: 3,
    block: 'C',
    status: 'active',
    joiningDate: '2021-08-15'
  },
  {
    id: 5,
    fullName: 'Vikram Singh',
    usn: '1MS22CS078',
    department: 'Computer Science',
    class: '3rd Year',
    semester: 5,
    email: 'vikram.singh@sjbit.edu.in',
    phone: '9876543218',
    guardianName: 'Harpreet Singh',
    guardianPhone: '9876543219',
    hostelType: 'boys',
    room: 'B-312',
    floor: 3,
    block: 'C',
    status: 'active',
    joiningDate: '2022-08-15'
  }
];

// Rooms
export const rooms = [
  { id: 1, number: 'B-101', hostel: 'boys', floor: 1, block: 'B', capacity: 2, occupied: 2, students: [1] },
  { id: 2, number: 'B-102', hostel: 'boys', floor: 1, block: 'B', capacity: 2, occupied: 1, students: [] },
  { id: 3, number: 'B-103', hostel: 'boys', floor: 1, block: 'B', capacity: 2, occupied: 0, students: [] },
  { id: 4, number: 'B-204', hostel: 'boys', floor: 2, block: 'B', capacity: 2, occupied: 2, students: [3] },
  { id: 5, number: 'B-312', hostel: 'boys', floor: 3, block: 'C', capacity: 2, occupied: 1, students: [5] },
  { id: 6, number: 'G-201', hostel: 'girls', floor: 2, block: 'A', capacity: 2, occupied: 2, students: [2] },
  { id: 7, number: 'G-202', hostel: 'girls', floor: 2, block: 'A', capacity: 2, occupied: 1, students: [] },
  { id: 8, number: 'G-203', hostel: 'girls', floor: 2, block: 'A', capacity: 2, occupied: 0, students: [] },
  { id: 9, number: 'G-305', hostel: 'girls', floor: 3, block: 'C', capacity: 2, occupied: 2, students: [4] }
];

// Fee records
export const feeRecords = [
  {
    id: 1,
    studentId: 1,
    studentName: 'Aarav Kumar',
    usn: '1MS22CS001',
    category: 'Semester Fee',
    term: 'Semester 5',
    amount: 45000,
    paid: 45000,
    balance: 0,
    status: 'paid',
    dueDate: getDate(-30),
    paidDate: getDate(-35),
    receiptNumber: 'RCP001'
  },
  {
    id: 2,
    studentId: 2,
    studentName: 'Priya Sharma',
    usn: '1MS22CS089',
    category: 'Semester Fee',
    term: 'Semester 5',
    amount: 45000,
    paid: 45000,
    balance: 0,
    status: 'paid',
    dueDate: getDate(-30),
    paidDate: getDate(-32),
    receiptNumber: 'RCP002'
  },
  {
    id: 3,
    studentId: 3,
    studentName: 'Rahul Verma',
    usn: '1MS22EC034',
    category: 'Semester Fee',
    term: 'Semester 3',
    amount: 45000,
    paid: 20000,
    balance: 25000,
    status: 'partial',
    dueDate: getDate(10),
    paidDate: getDate(-10),
    receiptNumber: 'RCP003'
  },
  {
    id: 4,
    studentId: 4,
    studentName: 'Ananya Desai',
    usn: '1MS22ME015',
    category: 'Semester Fee',
    term: 'Semester 7',
    amount: 45000,
    paid: 0,
    balance: 45000,
    status: 'overdue',
    dueDate: getDate(-15),
    paidDate: null,
    receiptNumber: null
  },
  {
    id: 5,
    studentId: 5,
    studentName: 'Vikram Singh',
    usn: '1MS22CS078',
    category: 'Semester Fee',
    term: 'Semester 5',
    amount: 45000,
    paid: 0,
    balance: 45000,
    status: 'pending',
    dueDate: getDate(20),
    paidDate: null,
    receiptNumber: null
  }
];

// Mess menu
export const messMenu = [
  {
    id: 1,
    date: getDate(0),
    day: 'Monday',
    breakfast: { items: ['Idli', 'Sambar', 'Chutney', 'Tea/Coffee'], time: '7:00 AM - 9:00 AM' },
    lunch: { items: ['Rice', 'Dal', 'Vegetable Curry', 'Chapati', 'Curd'], time: '12:00 PM - 2:00 PM' },
    snacks: { items: ['Tea/Coffee', 'Biscuits'], time: '4:00 PM - 5:00 PM' },
    dinner: { items: ['Rice', 'Sambar', 'Dry Vegetable', 'Chapati', 'Pickle'], time: '7:00 PM - 9:00 PM' }
  },
  {
    id: 2,
    date: getDate(1),
    day: 'Tuesday',
    breakfast: { items: ['Dosa', 'Potato Curry', 'Chutney', 'Tea/Coffee'], time: '7:00 AM - 9:00 AM' },
    lunch: { items: ['Rice', 'Rasam', 'Vegetable Curry', 'Chapati', 'Buttermilk'], time: '12:00 PM - 2:00 PM' },
    snacks: { items: ['Tea/Coffee', 'Pakora'], time: '4:00 PM - 5:00 PM' },
    dinner: { items: ['Pulao', 'Raita', 'Paneer Curry', 'Chapati'], time: '7:00 PM - 9:00 PM' }
  }
];

// In/Out register
export const movementRecords = [
  {
    id: 1,
    studentId: 5,
    studentName: 'Vikram Singh',
    usn: '1MS22CS078',
    hostel: 'Boys Hostel',
    room: 'B-312',
    departureTime: getDateTime(-3, 10),
    expectedReturn: getDateTime(0, 18),
    actualReturn: null,
    status: 'out',
    reason: 'Home visit'
  },
  {
    id: 2,
    studentId: 1,
    studentName: 'Aarav Kumar',
    usn: '1MS22CS001',
    hostel: 'Boys Hostel',
    room: 'B-101',
    departureTime: getDateTime(-5, 14),
    expectedReturn: getDateTime(-3, 20),
    actualReturn: getDateTime(-3, 19),
    status: 'returned',
    reason: 'Medical appointment'
  },
  {
    id: 3,
    studentId: 2,
    studentName: 'Priya Sharma',
    usn: '1MS22CS089',
    hostel: 'Girls Hostel',
    room: 'G-201',
    departureTime: getDateTime(-1, 15),
    expectedReturn: getDateTime(1, 10),
    actualReturn: null,
    status: 'out',
    reason: 'Family function'
  },
  {
    id: 4,
    studentId: 4,
    studentName: 'Ananya Desai',
    usn: '1MS22ME015',
    hostel: 'Girls Hostel',
    room: 'G-305',
    departureTime: getDateTime(-8, 11),
    expectedReturn: getDateTime(-6, 18),
    actualReturn: getDateTime(-5, 14),
    status: 'returned',
    reason: 'Home visit'
  }
];

// Grievances
export const grievances = [
  {
    id: 1,
    studentId: 1,
    studentName: 'Aarav Kumar',
    usn: '1MS22CS001',
    category: 'Infrastructure',
    subject: 'WiFi connectivity issue in Block B',
    description: 'The WiFi connection in Block B, Floor 1 has been very weak for the past week. Unable to attend online classes properly.',
    priority: 'high',
    status: 'open',
    submittedDate: getDateTime(-2, 14),
    updatedDate: getDateTime(-2, 14),
    responses: []
  },
  {
    id: 2,
    studentId: 2,
    studentName: 'Priya Sharma',
    usn: '1MS22CS089',
    category: 'Maintenance',
    subject: 'Room fan not working',
    description: 'The ceiling fan in room G-201 has stopped working. Please send someone for repair.',
    priority: 'medium',
    status: 'in_progress',
    submittedDate: getDateTime(-4, 10),
    updatedDate: getDateTime(-1, 9),
    responses: [
      {
        id: 1,
        respondent: 'Admin',
        message: 'Maintenance team has been notified. They will visit tomorrow.',
        timestamp: getDateTime(-1, 9)
      }
    ]
  },
  {
    id: 3,
    studentId: 3,
    studentName: 'Rahul Verma',
    usn: '1MS22EC034',
    category: 'Mess',
    subject: 'Food quality concern',
    description: 'The dinner quality has been consistently poor for the last few days. Multiple students have complained.',
    priority: 'high',
    status: 'open',
    submittedDate: getDateTime(-1, 20),
    updatedDate: getDateTime(-1, 20),
    responses: []
  },
  {
    id: 4,
    studentId: 4,
    studentName: 'Ananya Desai',
    usn: '1MS22ME015',
    category: 'Security',
    subject: 'Gate entry delay',
    description: 'Yesterday evening, there was a 30-minute delay at the security gate. Request to streamline the process.',
    priority: 'low',
    status: 'resolved',
    submittedDate: getDateTime(-10, 19),
    updatedDate: getDateTime(-8, 11),
    responses: [
      {
        id: 1,
        respondent: 'Admin',
        message: 'We have added additional security staff during peak hours. The issue should be resolved now.',
        timestamp: getDateTime(-8, 11)
      }
    ]
  }
];

// Notices
export const notices = [
  {
    id: 1,
    title: 'Semester Fee Payment Deadline',
    body: 'All students are requested to clear their semester fees by ' + getDate(20) + '. Late fee will be applicable after the due date.',
    audience: 'all',
    publishDate: getDateTime(-5, 10),
    expiryDate: getDate(20),
    status: 'published',
    author: 'Admin'
  },
  {
    id: 2,
    title: 'Hostel Rooms Inspection',
    body: 'Hostel rooms inspection will be conducted on ' + getDate(7) + '. All students must ensure their rooms are clean and organized.',
    audience: 'all',
    publishDate: getDateTime(-3, 14),
    expiryDate: getDate(7),
    status: 'published',
    author: 'Warden'
  },
  {
    id: 3,
    title: 'Boys Hostel - Maintenance Work',
    body: 'Water supply will be interrupted in Boys Hostel on ' + getDate(2) + ' from 9 AM to 2 PM due to plumbing maintenance. Please plan accordingly.',
    audience: 'boys',
    publishDate: getDateTime(-1, 11),
    expiryDate: getDate(2),
    status: 'published',
    author: 'Maintenance'
  },
  {
    id: 4,
    title: 'Girls Hostel - Cultural Event',
    body: 'A cultural event will be organized in the Girls Hostel common room on ' + getDate(5) + ' at 6 PM. All are invited to participate.',
    audience: 'girls',
    publishDate: getDateTime(-2, 15),
    expiryDate: getDate(5),
    status: 'published',
    author: 'Admin'
  },
  {
    id: 5,
    title: 'New Mess Menu',
    body: 'A new mess menu will be introduced from next week. Suggestions are welcome.',
    audience: 'all',
    publishDate: getDateTime(-7, 12),
    expiryDate: null,
    status: 'draft',
    author: 'Mess Manager'
  }
];

// Generate more rooms for a complete hostel structure
export const generateAllRooms = () => {
  const allRooms = [];
  const hostels = ['boys', 'girls'];
  const floors = [1, 2, 3, 4];
  const blocks = ['A', 'B', 'C'];

  let roomId = 1;
  hostels.forEach(hostel => {
    floors.forEach(floor => {
      blocks.forEach(block => {
        // 20 rooms per block (10 per side)
        for (let roomNum = 1; roomNum <= 20; roomNum++) {
          const roomNumber = `${hostel === 'boys' ? 'B' : 'G'}-${floor}${block}${roomNum.toString().padStart(2, '0')}`;
          // Randomly assign occupancy for demo
          const capacity = 2;
          const occupied = Math.random() > 0.15 ? (Math.random() > 0.3 ? 2 : 1) : 0;

          allRooms.push({
            id: roomId++,
            number: roomNumber,
            hostel,
            floor,
            block,
            capacity,
            occupied,
            students: []
          });
        }
      });
    });
  });

  return allRooms;
};
