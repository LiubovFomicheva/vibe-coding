import axios from 'axios';
import {
  Employee,
  BuddyProfile,
  BuddyMatch,
  BuddyMatchRecommendation,
  CreateEmployeeRequest,
  CreateBuddyProfileRequest,
  UpdateBuddyProfileRequest,
  CreateMatchRequest,
  Message,
  AnalyticsData,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5104/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth (when implemented)
api.interceptors.request.use((config) => {
  // Add auth token here when JWT is implemented
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Employee API
export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/employees');
    return response.data;
  },

  getById: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  getBuddyGuides: async (): Promise<Employee[]> => {
    const response = await api.get('/employees/buddy-guides');
    return response.data;
  },

  getNewcomers: async (): Promise<Employee[]> => {
    const response = await api.get('/employees/newcomers');
    return response.data;
  },

  create: async (employee: CreateEmployeeRequest): Promise<Employee> => {
    const response = await api.post('/employees', employee);
    return response.data;
  },

  createBuddyProfile: async (
    employeeId: string,
    profile: CreateBuddyProfileRequest
  ): Promise<BuddyProfile> => {
    const response = await api.post(`/employees/${employeeId}/buddy-profile`, profile);
    return response.data;
  },
};

// Matching API
export const matchingApi = {
  getRecommendations: async (
    newcomerId: string,
    maxRecommendations: number = 5
  ): Promise<BuddyMatchRecommendation[]> => {
    const response = await api.get(
      `/matching/recommendations/${newcomerId}?maxRecommendations=${maxRecommendations}`
    );
    return response.data;
  },

  getCompatibilityScore: async (buddyId: string, newcomerId: string): Promise<number> => {
    const response = await api.get(`/matching/compatibility/${buddyId}/${newcomerId}`);
    return response.data.compatibilityScore;
  },

  createMatch: async (request: CreateMatchRequest): Promise<{ matchId: string; compatibilityScore: number }> => {
    const response = await api.post('/matching/create', request);
    return response.data;
  },

  acceptMatch: async (matchId: string, buddyId: string): Promise<void> => {
    await api.post(`/matching/accept/${matchId}`, { buddyId });
  },

  rejectMatch: async (matchId: string, buddyId: string, reason?: string): Promise<void> => {
    await api.post(`/matching/reject/${matchId}`, { buddyId, reason });
  },
};

// Buddy API
export const buddyApi = {
  getProfiles: async (): Promise<BuddyProfile[]> => {
    const response = await api.get('/buddies');
    return response.data;
  },

  getProfile: async (id: string): Promise<BuddyProfile> => {
    const response = await api.get(`/buddies/${id}`);
    return response.data;
  },

  getProfileByEmployeeId: async (employeeId: string): Promise<BuddyProfile> => {
    const response = await api.get(`/buddies/employee/${employeeId}`);
    return response.data;
  },

  getAvailable: async (): Promise<BuddyProfile[]> => {
    const response = await api.get('/buddies/available');
    return response.data;
  },

  createProfile: async (employeeId: string, profile: CreateBuddyProfileRequest): Promise<BuddyProfile> => {
    const response = await api.post(`/buddies/employee/${employeeId}`, profile);
    return response.data;
  },

  updateProfile: async (id: string, profile: UpdateBuddyProfileRequest): Promise<BuddyProfile> => {
    const response = await api.put(`/buddies/${id}`, profile);
    return response.data;
  },
};

// Match API
export const matchApi = {
  getAll: async (): Promise<BuddyMatch[]> => {
    const response = await api.get('/matches');
    return response.data;
  },

  getByBuddy: async (buddyId: string): Promise<BuddyMatch[]> => {
    const response = await api.get(`/matches/buddy/${buddyId}`);
    return response.data;
  },

  getByNewcomer: async (newcomerId: string): Promise<BuddyMatch[]> => {
    const response = await api.get(`/matches/newcomer/${newcomerId}`);
    return response.data;
  },

  getById: async (id: string): Promise<BuddyMatch> => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },
};

// Message API
export const messageApi = {
  getByMatch: async (matchId: string): Promise<Message[]> => {
    const response = await api.get(`/messaging/match/${matchId}`);
    return response.data;
  },

  send: async (matchId: string, content: string, receiverId: string): Promise<Message> => {
    const response = await api.post('/messaging', {
      matchId,
      content,
      receiverId,
    });
    return response.data;
  },

  markAsRead: async (matchId: string, userId: string): Promise<void> => {
    await api.post('/messaging/mark-read', {
      matchId,
      userId,
    });
  },

  getConversations: async (userId: string): Promise<any[]> => {
    const response = await api.get(`/messaging/conversations/${userId}`);
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getDashboardData: async (): Promise<AnalyticsData> => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  getBuddyPerformance: async (buddyId: string): Promise<any> => {
    const response = await api.get(`/analytics/buddy/${buddyId}/performance`);
    return response.data;
  },

  getMatchingTrends: async (startDate: string, endDate: string): Promise<any> => {
    const response = await api.get(
      `/analytics/trends?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },
};

// Gamification API
export const gamificationApi = {
  getGameProfile: async (buddyId: string): Promise<any> => {
    const response = await api.get(`/gamification/profile/${buddyId}`);
    return response.data;
  },

  getLeaderboard: async (type: 'monthly' | 'allTime' | 'risingStars' | 'consistency' | 'newcomerHeroes' | 'teamChampions' = 'monthly'): Promise<any[]> => {
    const endpoint = type === 'monthly' ? '/gamification/leaderboard/monthly' :
                    type === 'allTime' ? '/gamification/leaderboard/all-time' :
                    type === 'risingStars' ? '/gamification/leaderboard/rising-stars' :
                    type === 'consistency' ? '/gamification/leaderboard/consistency-champions' :
                    type === 'newcomerHeroes' ? '/gamification/leaderboard/newcomer-heroes' :
                    type === 'teamChampions' ? '/gamification/leaderboard/team-champions' :
                    '/gamification/leaderboard/monthly';
    
    const response = await api.get(endpoint);
    return response.data;
  },

  awardPoints: async (buddyId: string, activityType: string, points: number, matchId?: string): Promise<any> => {
    const response = await api.post('/gamification/award-points', {
      buddyId,
      activityType,
      points,
      matchId,
    });
    return response.data;
  },
};

// Feedback API
export const feedbackApi = {
  submit: async (matchId: string, rating: number, comments: string, newcomerId: string): Promise<any> => {
    const response = await api.post('/feedback', {
      matchId,
      rating,
      comments,
      newcomerId,
    });
    return response.data;
  },

  getForMatch: async (matchId: string): Promise<any[]> => {
    const response = await api.get(`/feedback/match/${matchId}`);
    return response.data;
  },

  getBuddyStats: async (buddyId: string): Promise<any> => {
    const response = await api.get(`/feedback/buddy/${buddyId}/stats`);
    return response.data;
  },

  getOverallStats: async (): Promise<any> => {
    const response = await api.get('/feedback/overall-stats');
    return response.data;
  },
};

export default api;
