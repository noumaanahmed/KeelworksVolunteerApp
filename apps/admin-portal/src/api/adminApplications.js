import { API_BASE_URL } from "../config/api";

export const getApiErrorMessage = (data, fallback = "Something went wrong") => {
  if (!data) return fallback;
  if (typeof data.message === "string" && data.message) return data.message;
  if (typeof data.error === "string") return data.error;
  if (data.error?.code) return data.error.code;
  return fallback;
};

const parseResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, fallbackMessage));
  }
  return data?.data || null;
};

export const fetchAdminApplications = async ({ token, page = 1, limit = 20, status = "", search = "", sort = "desc" }) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);

  const response = await fetch(`${API_BASE_URL}/api/v1/applications/admin?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return parseResponse(response, "Failed to load applications");
};

export const fetchAdminApplicationDetail = async ({ token, employeeId }) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/applications/admin/${employeeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await parseResponse(response, "Failed to load application details");
  return data?.application || null;
};

export const updateApplicationStatus = async ({ token, employeeId, status, note, forwardedTo }) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/applications/admin/${employeeId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
      note,
      forwarded_to: forwardedTo,
    }),
  });

  const data = await parseResponse(response, "Failed to update application status");
  return data?.application || null;
};
