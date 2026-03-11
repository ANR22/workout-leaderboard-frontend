// API service for leaderboard
const API_BASE_URL = 'http://localhost:8080'; // Update with your backend URL
const TOKEN_STORAGE_KEY = 'leaderboard_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const buildHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface AuthResponse {
  status: 'SUCCESS' | 'ERROR';
  userId?: number;
  fullName?: string;
  token?: string;
  message: string;
}

export interface LeaderboardEntry {
  metricId: number;
  aggregatedScore: number;
  rank: number;
  userId: number;
}

export interface Challenge {
  id: number;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  details?: string;
}

export interface LeaderboardResponse {
  challengeId: number;
  count: number;
  status: string;
  leaderboard: LeaderboardEntry[];
}

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as AuthResponse;
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};

export const signupUser = async (
  fullName: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullName, email, password }),
  });

  const data = (await response.json()) as AuthResponse;
  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }

  return data;
};

export const getChallenges = async (): Promise<Challenge[]> => {
  const response = await fetch(`${API_BASE_URL}/leaderboard/challenges`, {
    headers: buildHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch challenges');
  }
  const data = await response.json();
  // backend may wrap result in object, handle common shapes
  if (Array.isArray(data)) {
    return data as Challenge[];
  }
  if (data && Array.isArray(data.challenges)) {
    return data.challenges as Challenge[];
  }
  console.warn('Unexpected challenges response', data);
  return [];
};

export const submitScore = async (
  challengeId: number,
  userId: number,
  value: number
): Promise<any> => {
  const payload = {
    eventId: Date.now(), // Generate unique integer event ID
    challengeId,
    userId,
    metricId: 1, // Hardcoded as requested
    value,
  };

  const response = await fetch(`${API_BASE_URL}/submit-score`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to submit score');
  }

  return await response.json();
};

export const getLeaderboard = async (
  challengeId: number
): Promise<LeaderboardResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/leaderboard/challenge/${challengeId}`,
    { headers: buildHeaders() }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  return await response.json();
};

export const getUserLeaderboard = async (
  challengeId: number,
  userId: string
): Promise<any> => {
  const response = await fetch(
    `${API_BASE_URL}/leaderboard/challenge/${challengeId}/user/${userId}`,
    { headers: buildHeaders() }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user leaderboard');
  }

  return await response.json();
};
