// NIVASA — In/Out movement request mock data and service
// ⚠️ FRONTEND-ONLY mock. Replace with backend API when available.

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const getDateTime = (offsetDays, hours = 10, minutes = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

/** @type {Array} */
let requests = [
  {
    id: 1,
    studentId: 1,
    studentName: "Aarav Kumar",
    usn: "1MS22CS001",
    hostel: "boys",
    room: "B-101",
    type: "exit",
    requestedDateTime: getDateTime(1, 10, 0),
    reason: "Weekend home visit",
    remarks: "Will return by Sunday evening",
    status: "pending",
    submittedAt: getDateTime(-1, 14, 30),
    reviewedBy: null,
    reviewedAt: null,
    adminRemarks: null,
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Priya Sharma",
    usn: "1MS22CS089",
    hostel: "girls",
    room: "G-201",
    type: "exit",
    requestedDateTime: getDateTime(0, 15, 0),
    reason: "Medical appointment",
    remarks: "Doctor visit at nearby clinic",
    status: "approved",
    submittedAt: getDateTime(-2, 9, 0),
    reviewedBy: "Girls' Hostel Admin",
    reviewedAt: getDateTime(-2, 11, 0),
    adminRemarks: "Approved. Please carry your ID card.",
  },
  {
    id: 3,
    studentId: 3,
    studentName: "Rahul Verma",
    usn: "1MS22EC034",
    hostel: "boys",
    room: "B-204",
    type: "entry",
    requestedDateTime: getDateTime(0, 20, 0),
    reason: "Returning from home",
    remarks: "",
    status: "pending",
    submittedAt: getDateTime(0, 8, 0),
    reviewedBy: null,
    reviewedAt: null,
    adminRemarks: null,
  },
  {
    id: 4,
    studentId: 4,
    studentName: "Ananya Desai",
    usn: "1MS22ME015",
    hostel: "girls",
    room: "G-305",
    type: "exit",
    requestedDateTime: getDateTime(-3, 11, 0),
    reason: "Family function",
    remarks: "My sister's wedding",
    status: "rejected",
    submittedAt: getDateTime(-4, 16, 0),
    reviewedBy: "Girls' Hostel Admin",
    reviewedAt: getDateTime(-4, 17, 0),
    adminRemarks: "Insufficient notice period. Please submit requests at least 48 hours in advance.",
  },
];

let idCounter = requests.length + 1;

/**
 * Get requests, optionally filtered by hostel and/or student.
 */
export const getMovementRequests = async (filters = {}) => {
  await delay();
  let result = [...requests];

  if (filters.hostel) {
    result = result.filter((r) => r.hostel === filters.hostel);
  }
  if (filters.studentId) {
    result = result.filter((r) => r.studentId === filters.studentId);
  }
  if (filters.status) {
    result = result.filter((r) => r.status === filters.status);
  }

  return result.sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
  );
};

/**
 * Submit a new request (student action).
 */
export const createMovementRequest = async (data) => {
  await delay(600);

  // Validate: no duplicate pending request for same student + type
  const hasDuplicate = requests.some(
    (r) =>
      r.studentId === data.studentId &&
      r.type === data.type &&
      r.status === "pending",
  );
  if (hasDuplicate) {
    throw new Error(
      `You already have a pending ${data.type} request. Please wait for it to be reviewed.`,
    );
  }

  const request = {
    id: idCounter++,
    ...data,
    status: "pending",
    submittedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    adminRemarks: null,
  };
  requests.push(request);
  return request;
};

/**
 * Approve a request (admin action).
 * NOTE: Approval does NOT automatically change attendance. It only updates
 * the request status. Actual presence changes require a separate confirmed
 * entry/exit event.
 */
export const approveRequest = async (id, adminRemarks = "", reviewerName = "Admin") => {
  await delay(500);
  const req = requests.find((r) => r.id === id);
  if (!req) throw new Error("Request not found");
  if (req.status !== "pending") throw new Error("Only pending requests can be approved");

  req.status = "approved";
  req.reviewedBy = reviewerName;
  req.reviewedAt = new Date().toISOString();
  req.adminRemarks = adminRemarks || "Approved";
  return { ...req };
};

/**
 * Reject a request (admin action).
 */
export const rejectRequest = async (id, adminRemarks = "", reviewerName = "Admin") => {
  await delay(500);
  const req = requests.find((r) => r.id === id);
  if (!req) throw new Error("Request not found");
  if (req.status !== "pending") throw new Error("Only pending requests can be rejected");

  req.status = "rejected";
  req.reviewedBy = reviewerName;
  req.reviewedAt = new Date().toISOString();
  req.adminRemarks = adminRemarks || "Rejected";
  return { ...req };
};

/**
 * Cancel a request (student action — only their own pending requests).
 */
export const cancelRequest = async (id, studentId) => {
  await delay(400);
  const req = requests.find((r) => r.id === id);
  if (!req) throw new Error("Request not found");
  if (req.studentId !== studentId) throw new Error("You can only cancel your own requests");
  if (req.status !== "pending") throw new Error("Only pending requests can be cancelled");

  req.status = "cancelled";
  return { ...req };
};
