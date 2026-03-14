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
  status: 'SUCCESS' | 'ERROR' | string;
  userId?: number;
  fullName?: string;
  token?: string;
  id?: number;
  name?: string;
  accessToken?: string;
  jwt?: string;
  message: string;
}

const normalizeAuthResponse = (raw: unknown): AuthResponse => {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const wrapped =
    source.data && typeof source.data === 'object'
      ? (source.data as Record<string, unknown>)
      : source;

  const statusRaw = (wrapped.status ?? source.status ?? 'ERROR') as string;
  const status = String(statusRaw).toUpperCase();

  return {
    status,
    userId: Number(wrapped.userId ?? wrapped.id ?? source.userId ?? source.id),
    fullName: String(
      (wrapped.fullName ?? wrapped.name ?? source.fullName ?? source.name ?? '')
    ) || undefined,
    token:
      (wrapped.token as string) ||
      (wrapped.accessToken as string) ||
      (wrapped.jwt as string) ||
      (source.token as string) ||
      (source.accessToken as string) ||
      (source.jwt as string) ||
      undefined,
    id: Number(wrapped.id ?? source.id),
    name: String((wrapped.name ?? source.name ?? '')) || undefined,
    accessToken:
      (wrapped.accessToken as string) ||
      (source.accessToken as string) ||
      undefined,
    jwt: (wrapped.jwt as string) || (source.jwt as string) || undefined,
    message: String(wrapped.message ?? source.message ?? 'Authentication failed'),
  };
};

export interface LeaderboardEntry {
  metricId: number;
  aggregatedScore: number;
  rank: number;
  userId: number;
  fullName?: string;
  userFullName?: string;
  userName?: string;
  name?: string;
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

  const data = normalizeAuthResponse(await response.json());
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

  const data = normalizeAuthResponse(await response.json());
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
