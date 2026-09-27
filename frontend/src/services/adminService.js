// NIVASA Admin Dashboard - Service Layer
// ⚠️ This is a mock service layer for development.
// Replace with actual Supabase/API calls in production.

import {
  dashboardStats,
  occupancyData,
  recentActivity,
  pendingActions,
  students,
  generateAllRooms,
  feeRecords,
  messMenu,
  movementRecords,
  grievances,
  notices
} from '../data/adminMockData';

// Simulated API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Dashboard Services
export const getDashboardStats = async () => {
  await delay();
  return dashboardStats;
};

export const getOccupancyData = async (hostelType = 'boys') => {
  await delay();
  return occupancyData[hostelType];
};

export const getRecentActivity = async () => {
  await delay();
  return recentActivity;
};

export const getPendingActions = async () => {
  await delay();
  return pendingActions;
};

export const getNoticesPreview = async () => {
  await delay();
  return notices.filter(n => n.status === 'published').slice(0, 3);
};

// Student Services
let studentsData = [...students];
let studentIdCounter = students.length + 1;

export const getStudents = async (filters = {}) => {
  await delay();
  let filtered = [...studentsData];

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(s =>
      s.fullName.toLowerCase().includes(search) ||
      s.usn.toLowerCase().includes(search)
    );
  }

  if (filters.hostel) {
    filtered = filtered.filter(s => s.hostelType === filters.hostel);
  }

  if (filters.department) {
    filtered = filtered.filter(s => s.department === filters.department);
  }

  if (filters.status) {
    filtered = filtered.filter(s => s.status === filters.status);
  }

  if (filters.floor) {
    filtered = filtered.filter(s => s.floor === parseInt(filters.floor));
  }

  if (filters.block) {
    filtered = filtered.filter(s => s.block === filters.block);
  }

  return filtered;
};

export const getStudentById = async (id) => {
  await delay();
  return studentsData.find(s => s.id === parseInt(id));
};

export const createStudent = async (studentData) => {
  await delay(700);
  const newStudent = {
    id: studentIdCounter++,
    ...studentData,
    status: 'active',
    joiningDate: new Date().toISOString().split('T')[0]
  };
  studentsData.push(newStudent);
  console.log('✅ [MOCK] Student created:', newStudent.fullName);
  return newStudent;
};

export const updateStudent = async (id, studentData) => {
  await delay(700);
  const index = studentsData.findIndex(s => s.id === parseInt(id));
  if (index !== -1) {
    studentsData[index] = { ...studentsData[index], ...studentData };
    console.log('✅ [MOCK] Student updated:', studentsData[index].fullName);
    return studentsData[index];
  }
  throw new Error('Student not found');
};

export const deleteStudent = async (id) => {
  await delay(700);
  const index = studentsData.findIndex(s => s.id === parseInt(id));
  if (index !== -1) {
    const student = studentsData[index];
    studentsData.splice(index, 1);
    console.log('✅ [MOCK] Student deleted:', student.fullName);
    return true;
  }
  throw new Error('Student not found');
};

// Room Services
let roomsData = generateAllRooms();

export const getRooms = async (filters = {}) => {
  await delay();
  let filtered = [...roomsData];

  if (filters.hostel) {
    filtered = filtered.filter(r => r.hostel === filters.hostel);
  }

  if (filters.floor) {
    filtered = filtered.filter(r => r.floor === parseInt(filters.floor));
  }

  if (filters.block) {
    filtered = filtered.filter(r => r.block === filters.block);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(r => r.number.toLowerCase().includes(search));
  }

  if (filters.availability === 'available') {
    filtered = filtered.filter(r => r.occupied < r.capacity);
  } else if (filters.availability === 'full') {
    filtered = filtered.filter(r => r.occupied >= r.capacity);
  }

  return filtered;
};

export const getRoomById = async (id) => {
  await delay();
  return roomsData.find(r => r.id === parseInt(id));
};

export const allocateRoom = async (studentId, roomId) => {
  await delay(700);
  const room = roomsData.find(r => r.id === parseInt(roomId));
  if (!room) throw new Error('Room not found');

  if (room.occupied >= room.capacity) {
    throw new Error('Room is full');
  }

  room.students.push(studentId);
  room.occupied += 1;
  console.log('✅ [MOCK] Room allocated:', room.number, 'to student', studentId);
  return room;
};

export const deallocateRoom = async (studentId, roomId) => {
  await delay(700);
  const room = roomsData.find(r => r.id === parseInt(roomId));
  if (!room) throw new Error('Room not found');

  const studentIndex = room.students.indexOf(studentId);
  if (studentIndex > -1) {
    room.students.splice(studentIndex, 1);
    room.occupied -= 1;
    console.log('✅ [MOCK] Room deallocated:', room.number, 'from student', studentId);
    return room;
  }
  throw new Error('Student not in this room');
};

// Fee Services
let feesData = [...feeRecords];
let feeIdCounter = feeRecords.length + 1;

export const getFeeRecords = async (filters = {}) => {
  await delay();
  let filtered = [...feesData];

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(f =>
      f.studentName.toLowerCase().includes(search) ||
      f.usn.toLowerCase().includes(search)
    );
  }

  if (filters.status) {
    filtered = filtered.filter(f => f.status === filters.status);
  }

  if (filters.category) {
    filtered = filtered.filter(f => f.category === filters.category);
  }

  return filtered;
};

export const createFeeRecord = async (feeData) => {
  await delay(700);
  const newFee = {
    id: feeIdCounter++,
    ...feeData,
    paid: feeData.paid || 0,
    balance: feeData.amount - (feeData.paid || 0),
    status: feeData.paid >= feeData.amount ? 'paid' : 'pending',
    paidDate: feeData.paid > 0 ? new Date().toISOString().split('T')[0] : null
  };
  feesData.push(newFee);
  console.log('✅ [MOCK] Fee record created for:', newFee.studentName);
  return newFee;
};

export const updateFeeRecord = async (id, feeData) => {
  await delay(700);
  const index = feesData.findIndex(f => f.id === parseInt(id));
  if (index !== -1) {
    feesData[index] = {
      ...feesData[index],
      ...feeData,
      balance: feeData.amount - feeData.paid,
      status: feeData.paid >= feeData.amount ? 'paid' :
              feeData.paid > 0 ? 'partial' : 'pending'
    };
    console.log('✅ [MOCK] Fee record updated for:', feesData[index].studentName);
    return feesData[index];
  }
  throw new Error('Fee record not found');
};

// Mess Services
let messData = [...messMenu];
let messIdCounter = messMenu.length + 1;

export const getMessMenu = async (filters = {}) => {
  await delay();
  let filtered = [...messData];

  if (filters.date) {
    filtered = filtered.filter(m => m.date === filters.date);
  }

  return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const createMessMenu = async (menuData) => {
  await delay(700);
  const newMenu = {
    id: messIdCounter++,
    ...menuData
  };
  messData.push(newMenu);
  console.log('✅ [MOCK] Mess menu created for:', menuData.date);
  return newMenu;
};

export const updateMessMenu = async (id, menuData) => {
  await delay(700);
  const index = messData.findIndex(m => m.id === parseInt(id));
  if (index !== -1) {
    messData[index] = { ...messData[index], ...menuData };
    console.log('✅ [MOCK] Mess menu updated for:', messData[index].date);
    return messData[index];
  }
  throw new Error('Menu not found');
};

export const deleteMessMenu = async (id) => {
  await delay(700);
  const index = messData.findIndex(m => m.id === parseInt(id));
  if (index !== -1) {
    const menu = messData[index];
    messData.splice(index, 1);
    console.log('✅ [MOCK] Mess menu deleted for:', menu.date);
    return true;
  }
  throw new Error('Menu not found');
};

// Movement Services
let movementsData = [...movementRecords];
let movementIdCounter = movementRecords.length + 1;

export const getMovementRecords = async (filters = {}) => {
  await delay();
  let filtered = [...movementsData];

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(m =>
      m.studentName.toLowerCase().includes(search) ||
      m.usn.toLowerCase().includes(search)
    );
  }

  if (filters.status) {
    filtered = filtered.filter(m => m.status === filters.status);
  }

  return filtered.sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
};

export const createMovementRecord = async (movementData) => {
  await delay(700);
  const newMovement = {
    id: movementIdCounter++,
    ...movementData,
    status: 'out',
    actualReturn: null
  };
  movementsData.push(newMovement);
  console.log('✅ [MOCK] Movement record created for:', movementData.studentName);
  return newMovement;
};

export const updateMovementRecord = async (id, movementData) => {
  await delay(700);
  const index = movementsData.findIndex(m => m.id === parseInt(id));
  if (index !== -1) {
    movementsData[index] = { ...movementsData[index], ...movementData };
    console.log('✅ [MOCK] Movement record updated for:', movementsData[index].studentName);
    return movementsData[index];
  }
  throw new Error('Movement record not found');
};

// Grievance Services
let grievancesData = [...grievances];

export const getGrievances = async (filters = {}) => {
  await delay();
  let filtered = [...grievancesData];

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(g =>
      g.studentName.toLowerCase().includes(search) ||
      g.usn.toLowerCase().includes(search) ||
      g.subject.toLowerCase().includes(search)
    );
  }

  if (filters.status) {
    filtered = filtered.filter(g => g.status === filters.status);
  }

  if (filters.category) {
    filtered = filtered.filter(g => g.category === filters.category);
  }

  if (filters.priority) {
    filtered = filtered.filter(g => g.priority === filters.priority);
  }

  return filtered.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
};

export const getGrievanceById = async (id) => {
  await delay();
  return grievancesData.find(g => g.id === parseInt(id));
};

export const updateGrievanceStatus = async (id, status) => {
  await delay(700);
  const index = grievancesData.findIndex(g => g.id === parseInt(id));
  if (index !== -1) {
    grievancesData[index].status = status;
    grievancesData[index].updatedDate = new Date().toISOString();
    console.log('✅ [MOCK] Grievance status updated to:', status);
    return grievancesData[index];
  }
  throw new Error('Grievance not found');
};

export const addGrievanceResponse = async (id, response) => {
  await delay(700);
  const index = grievancesData.findIndex(g => g.id === parseInt(id));
  if (index !== -1) {
    const newResponse = {
      id: grievancesData[index].responses.length + 1,
      respondent: 'Admin',
      message: response,
      timestamp: new Date().toISOString()
    };
    grievancesData[index].responses.push(newResponse);
    grievancesData[index].updatedDate = new Date().toISOString();
    console.log('✅ [MOCK] Response added to grievance #', id);
    return grievancesData[index];
  }
  throw new Error('Grievance not found');
};

// Notice Services
let noticesData = [...notices];
let noticeIdCounter = notices.length + 1;

export const getNotices = async (filters = {}) => {
  await delay();
  let filtered = [...noticesData];

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(search) ||
      n.body.toLowerCase().includes(search)
    );
  }

  if (filters.status) {
    filtered = filtered.filter(n => n.status === filters.status);
  }

  if (filters.audience) {
    filtered = filtered.filter(n => n.audience === filters.audience || n.audience === 'all');
  }

  return filtered.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
};

export const getNoticeById = async (id) => {
  await delay();
  return noticesData.find(n => n.id === parseInt(id));
};

export const createNotice = async (noticeData) => {
  await delay(700);
  const newNotice = {
    id: noticeIdCounter++,
    ...noticeData,
    publishDate: new Date().toISOString(),
    author: 'Admin'
  };
  noticesData.push(newNotice);
  console.log('✅ [MOCK] Notice created:', newNotice.title);
  return newNotice;
};

export const updateNotice = async (id, noticeData) => {
  await delay(700);
  const index = noticesData.findIndex(n => n.id === parseInt(id));
  if (index !== -1) {
    noticesData[index] = { ...noticesData[index], ...noticeData };
    console.log('✅ [MOCK] Notice updated:', noticesData[index].title);
    return noticesData[index];
  }
  throw new Error('Notice not found');
};

export const deleteNotice = async (id) => {
  await delay(700);
  const index = noticesData.findIndex(n => n.id === parseInt(id));
  if (index !== -1) {
    const notice = noticesData[index];
    noticesData.splice(index, 1);
    console.log('✅ [MOCK] Notice deleted:', notice.title);
    return true;
  }
  throw new Error('Notice not found');
};
