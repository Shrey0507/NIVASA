// NIVASA — Student portal mock data
// ⚠️ Fictional demo data. Replace with API responses in a later phase.

const getDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

const getDateTime = (offsetDays, hours = 10, minutes = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

// The signed-in resident (demo).
export const currentStudent = {
  id: 1,
  fullName: "Aarav Kumar",
  usn: "1MS22CS001",
  department: "Computer Science",
  class: "3rd Year",
  semester: 5,
  email: "aarav.kumar@sjbit.edu.in",
  phone: "9876543210",
  guardianName: "Rajesh Kumar",
  guardianPhone: "9876543211",
  hostelType: "boys",
  building: "Boys' Hostel",
  floor: 1,
  block: "B",
  room: "B-101",
  bed: "A",
  status: "active",
  joiningDate: "2022-08-15",
  warden: "Mr. Samuel D'Souza",
  wardenPhone: "9886001122",
};

export const studentFeeRecords = [
  {
    id: 1,
    category: "Semester Fee",
    term: "Semester 5",
    amount: 45000,
    paid: 45000,
    balance: 0,
    status: "paid",
    dueDate: getDate(-30),
    paidDate: getDate(-35),
    receiptNumber: "RCP001",
  },
  {
    id: 2,
    category: "Hostel Fee",
    term: "2025-26 (Odd)",
    amount: 32000,
    paid: 32000,
    balance: 0,
    status: "paid",
    dueDate: getDate(-60),
    paidDate: getDate(-58),
    receiptNumber: "RCP014",
  },
  {
    id: 3,
    category: "Mess Fee",
    term: "December 2025",
    amount: 6000,
    paid: 0,
    balance: 6000,
    status: "pending",
    dueDate: getDate(12),
    paidDate: null,
    receiptNumber: null,
  },
  {
    id: 4,
    category: "Semester Fee",
    term: "Semester 4",
    amount: 45000,
    paid: 45000,
    balance: 0,
    status: "paid",
    dueDate: getDate(-210),
    paidDate: getDate(-214),
    receiptNumber: "RCP002",
  },
];

export const studentFeeSummary = {
  totalBilled: studentFeeRecords.reduce((sum, f) => sum + f.amount, 0),
  totalPaid: studentFeeRecords.reduce((sum, f) => sum + f.paid, 0),
  outstanding: studentFeeRecords.reduce((sum, f) => sum + f.balance, 0),
  nextDueDate: getDate(12),
};

const MEAL_TIMES = {
  breakfast: "7:00 AM - 9:00 AM",
  lunch: "12:00 PM - 2:00 PM",
  snacks: "4:00 PM - 5:00 PM",
  dinner: "7:00 PM - 9:00 PM",
};

export const studentMessMenu = [
  {
    id: 1,
    date: getDate(0),
    day: "Today",
    breakfast: { items: ["Idli", "Sambar", "Coconut Chutney", "Tea / Coffee"], time: MEAL_TIMES.breakfast },
    lunch: { items: ["Rice", "Dal Tadka", "Vegetable Curry", "Chapati", "Curd"], time: MEAL_TIMES.lunch },
    snacks: { items: ["Tea / Coffee", "Biscuits"], time: MEAL_TIMES.snacks },
    dinner: { items: ["Rice", "Sambar", "Dry Vegetable", "Chapati", "Pickle"], time: MEAL_TIMES.dinner },
  },
  {
    id: 2,
    date: getDate(1),
    day: "Tomorrow",
    breakfast: { items: ["Dosa", "Potato Curry", "Chutney", "Tea / Coffee"], time: MEAL_TIMES.breakfast },
    lunch: { items: ["Rice", "Rasam", "Vegetable Curry", "Chapati", "Buttermilk"], time: MEAL_TIMES.lunch },
    snacks: { items: ["Tea / Coffee", "Pakora"], time: MEAL_TIMES.snacks },
    dinner: { items: ["Pulao", "Raita", "Paneer Curry", "Chapati"], time: MEAL_TIMES.dinner },
  },
  {
    id: 3,
    date: getDate(2),
    day: "Upcoming",
    breakfast: { items: ["Poha", "Banana", "Tea / Coffee"], time: MEAL_TIMES.breakfast },
    lunch: { items: ["Rice", "Sambar", "Beans Palya", "Chapati", "Curd"], time: MEAL_TIMES.lunch },
    snacks: { items: ["Tea / Coffee", "Samosa"], time: MEAL_TIMES.snacks },
    dinner: { items: ["Fried Rice", "Gobi Manchurian", "Chapati"], time: MEAL_TIMES.dinner },
  },
];

export const studentMovements = [
  {
    id: 1,
    departureTime: getDateTime(-3, 10, 15),
    expectedReturn: getDateTime(0, 18, 0),
    actualReturn: null,
    status: "out",
    reason: "Home visit",
  },
  {
    id: 2,
    departureTime: getDateTime(-9, 14, 30),
    expectedReturn: getDateTime(-7, 20, 0),
    actualReturn: getDateTime(-7, 19, 10),
    status: "returned",
    reason: "Medical appointment",
  },
  {
    id: 3,
    departureTime: getDateTime(-18, 9, 45),
    expectedReturn: getDateTime(-16, 21, 0),
    actualReturn: getDateTime(-16, 20, 5),
    status: "returned",
    reason: "Family function",
  },
];

export const studentGrievances = [
  {
    id: 1,
    category: "Infrastructure",
    subject: "WiFi connectivity issue in Block B",
    description:
      "The WiFi connection in Block B, Floor 1 has been very weak for the past week. Unable to attend online classes properly.",
    priority: "high",
    status: "open",
    submittedDate: getDateTime(-2, 14, 0),
    updatedDate: getDateTime(-2, 14, 0),
    responses: [],
  },
  {
    id: 2,
    category: "Maintenance",
    subject: "Study table light flickering",
    description:
      "The tube light above my study table flickers continuously. It has been replaced once but the issue persists.",
    priority: "medium",
    status: "in_progress",
    submittedDate: getDateTime(-6, 11, 20),
    updatedDate: getDateTime(-3, 9, 30),
    responses: [
      {
        id: 1,
        respondent: "Admin",
        message:
          "An electrician has been assigned and will visit within two days.",
        timestamp: getDateTime(-3, 9, 30),
      },
    ],
  },
  {
    id: 3,
    category: "Mess",
    subject: "Request for variety in breakfast",
    description:
      "Breakfast options have repeated a lot this month. It would help to add more variety.",
    priority: "low",
    status: "resolved",
    submittedDate: getDateTime(-20, 18, 0),
    updatedDate: getDateTime(-16, 12, 0),
    responses: [
      {
        id: 1,
        respondent: "Mess Manager",
        message:
          "Thanks for the suggestion. A revised breakfast rotation has been introduced this week.",
        timestamp: getDateTime(-16, 12, 0),
      },
    ],
  },
];

export const studentNotices = [
  {
    id: 1,
    title: "Semester Fee Payment Deadline",
    body: `All students are requested to clear their semester fees by ${getDate(
      20,
    )}. Late fee will be applicable after the due date.`,
    audience: "all",
    publishDate: getDateTime(-5, 10, 0),
    expiryDate: getDate(20),
    author: "Admin",
    status: "published",
  },
  {
    id: 2,
    title: "Hostel Rooms Inspection",
    body: `Hostel rooms inspection will be conducted on ${getDate(
      7,
    )}. All students must ensure their rooms are clean and organised.`,
    audience: "all",
    publishDate: getDateTime(-3, 14, 0),
    expiryDate: getDate(7),
    author: "Warden",
    status: "published",
  },
  {
    id: 3,
    title: "Boys Hostel — Water Supply Maintenance",
    body: `Water supply will be interrupted in Boys Hostel on ${getDate(
      2,
    )} from 9 AM to 2 PM due to plumbing maintenance. Please plan accordingly.`,
    audience: "boys",
    publishDate: getDateTime(-1, 11, 0),
    expiryDate: getDate(2),
    author: "Maintenance",
    status: "published",
  },
  {
    id: 4,
    title: "Reading Room Extended Hours",
    body: "The common reading room will remain open until 1 AM during the examination period.",
    audience: "all",
    publishDate: getDateTime(-8, 16, 0),
    expiryDate: getDate(30),
    author: "Admin",
    status: "published",
  },
];

// Occupancy trend used on the student dashboard (last 6 weeks, hostel-wide %).
export const studentOccupancyTrend = [
  { week: "W1", occupancy: 82 },
  { week: "W2", occupancy: 84 },
  { week: "W3", occupancy: 83 },
  { week: "W4", occupancy: 86 },
  { week: "W5", occupancy: 85 },
  { week: "W6", occupancy: 88 },
];
