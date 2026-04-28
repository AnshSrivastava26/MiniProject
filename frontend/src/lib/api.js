export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://miniproject-yb9j.onrender.com";

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "API request failed");
  }

  return data;
};
