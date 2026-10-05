// NIVASA - Credential service (MOCK). Replace with backend/Supabase calls.
// Real enforcement of "admin only" MUST live on the server (RLS / API role check).
// Passwords are never stored here; a temp password is returned once at creation/reset.
import { getStudents } from './adminService';

const session = { role: 'admin' }; // TODO: replace with real auth session
const assertAdmin = () => {
  if (session.role !== 'admin') throw new Error('Only admins can manage credentials');
};
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

const genPassword = (len = 12) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%';
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, n => chars[n % chars.length]).join('');
};

let creds = null;
let idCounter = 1;

const ensureSeed = async () => {
  if (creds) return;
  const students = await getStudents();
  creds = students.slice(0, 2).map(s => ({
    id: idCounter++,
    studentId: s.id,
    studentName: s.fullName,
    usn: s.usn,
    hostelType: s.hostelType,
    username: s.usn.toLowerCase(),
    status: 'active',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    lastLogin: null
  }));
};

export const listCredentials = async (filters = {}) => {
  assertAdmin();
  await delay();
  await ensureSeed();
  let out = [...creds];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    out = out.filter(c =>
      c.studentName.toLowerCase().includes(q) ||
      c.usn.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q));
  }
  if (filters.status) out = out.filter(c => c.status === filters.status);
  return out;
};

// Students who don't have a credential yet
export const getEligibleStudents = async () => {
  assertAdmin();
  await ensureSeed();
  const students = await getStudents({ status: 'active' });
  const taken = new Set(creds.map(c => c.studentId));
  return students.filter(s => !taken.has(s.id));
};

export const createCredential = async (studentId, username) => {
  assertAdmin();
  await delay(600);
  await ensureSeed();
  const student = (await getStudents()).find(s => s.id === parseInt(studentId));
  if (!student) throw new Error('Student not found');
  if (creds.some(c => c.studentId === student.id)) throw new Error('Student already has a credential');
  const name = (username || student.usn).trim().toLowerCase();
  if (!/^[a-z0-9._-]{4,30}$/.test(name)) throw new Error('Username must be 4-30 chars (a-z, 0-9, . _ -)');
  if (creds.some(c => c.username === name)) throw new Error('Username already taken');
  const credential = {
    id: idCounter++,
    studentId: student.id,
    studentName: student.fullName,
    usn: student.usn,
    hostelType: student.hostelType,
    username: name,
    status: 'active',
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
    lastLogin: null
  };
  creds.push(credential);
  return { credential, tempPassword: genPassword() };
};

export const resetPassword = async (id) => {
  assertAdmin();
  await delay(500);
  const c = creds.find(x => x.id === id);
  if (!c) throw new Error('Credential not found');
  c.mustChangePassword = true;
  return { credential: c, tempPassword: genPassword() };
};

export const setCredentialStatus = async (id, status) => {
  assertAdmin();
  await delay(400);
  const c = creds.find(x => x.id === id);
  if (!c) throw new Error('Credential not found');
  c.status = status;
  return c;
};

export const revokeCredential = async (id) => {
  assertAdmin();
  await delay(400);
  const i = creds.findIndex(x => x.id === id);
  if (i === -1) throw new Error('Credential not found');
  creds.splice(i, 1);
  return true;
};
