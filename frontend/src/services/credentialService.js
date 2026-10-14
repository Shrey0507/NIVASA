import { apiRequest } from "@/lib/apiClient";
export const getCredentials = async () => (await apiRequest("/students?limit=100")).data || [];
export const getEligibleStudents = async () => (await apiRequest("/students?status=active&limit=100")).data || [];
export const createCredential = async (data) => { void data; throw new Error("Student credentials are provisioned through Supabase Auth; an administrator must use the approved provisioning workflow."); };
export const resetPassword = async () => { throw new Error("Use the password recovery email workflow; passwords are never generated or returned by the browser."); };
export const setCredentialStatus = async () => { throw new Error("Credential status is managed by Supabase Auth and cannot be changed by this screen."); };
export const revokeCredential = async () => { throw new Error("Credential revocation is managed by Supabase Auth administrators."); };
