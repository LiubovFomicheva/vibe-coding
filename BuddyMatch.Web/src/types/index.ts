// Employee Types
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  unit: string;
  team: string;
  location: string;
  startDate: string;
  role: EmployeeRole;
  techStack: string;
  languages: string;
  interests: string;
  createdAt: string;
  updatedAt: string;
  isBuddyGuide: boolean;
  isNewcomer: boolean;
  fullName: string;
  buddyProfile?: BuddyProfile;
}

export enum EmployeeRole {
  HR = 1,
  Employee = 2
}

// Buddy Profile Types
export enum BuddyAvailability {
  Low = 1,
  Medium = 2,
  High = 3,
  VeryHigh = 4
}

export interface BuddyProfile {
  id: string;
  employeeId: string;
  isActive: boolean;
  maxActiveBuddies: number;
  bio: string;
  specialties: string;
  buddyLocation?: string;
  buddyUnit?: string;
  buddyTechStack?: string;
  interests?: string;
  availability: BuddyAvailability;
  createdAt: string;
  updatedAt: string;
  currentActiveBuddies: number;
  canAcceptNewBuddy: boolean;
  availabilityScore: number;
  effectiveLocation: string;
  effectiveUnit: string;
  effectiveTechStack: string;
  effectiveInterests: string;
  employee: Employee;
  gameProfile?: BuddyGameProfile;
}

// Match Types
export interface BuddyMatch {
  id: string;
  buddyId: string;
  newcomerId: string;
  createdByHRId: string;
  status: MatchStatus;
  compatibilityScore: number;
  notes: string;
  createdAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  updatedAt: string;
  buddy: Employee;
  newcomer: Employee;
  createdByHR: Employee;
}

export enum MatchStatus {
  Pending = 1,
  Active = 2,
  Rejected = 3,
  Completed = 4,
  Expired = 5
}

// Recommendation Types
export interface BuddyMatchRecommendation {
  buddyId: string;
  buddyName: string;
  title: string;
  unit: string;
  location: string;
  compatibilityScore: number;
  currentActiveBuddies: number;
  maxActiveBuddies: number;
  canAcceptNewBuddy: boolean;
  matchingTechStack: string[];
  matchingInterests: string[];
  reasonForRecommendation: string;
}

// Gamification Types
export interface BuddyGameProfile {
  id: string;
  buddyProfileId: string;
  totalPoints: number;
  monthlyPoints: number;
  currentLevel: BuddyLevel;
  streakDays: number;
  lastActivityDate: string;
  pointsToNextLevel: number;
  levelProgress: number;
  badges: Badge[];
  achievements: Achievement[];
}

export enum BuddyLevel {
  Bronze = 1,
  Silver = 2,
  Gold = 3,
  Platinum = 4,
  Diamond = 5
}

export interface Badge {
  id: string;
  gameProfileId: string;
  name: string;
  description: string;
  category: BadgeCategory;
  iconUrl: string;
  pointValue: number;
  earnedDate: string;
}

export enum BadgeCategory {
  Mentorship = 1,
  Expertise = 2,
  Special = 3,
  Achievement = 4
}

export interface Achievement {
  id: string;
  gameProfileId: string;
  activityType: AchievementType;
  pointsAwarded: number;
  multiplier: number;
  relatedMatchId?: string;
  description: string;
  earnedDate: string;
}

export enum AchievementType {
  ProfileComplete = 1,
  MatchAccept = 2,
  FirstWeekCheckIn = 3,
  MonthlyFeedback = 4,
  FiveStarRating = 5,
  ThreeMonthRelationship = 6,
  SuccessfulCompletion = 7,
  CrossTeamMentoring = 8,
  HighPriorityMatch = 9,
  PerfectMonth = 10
}

// Message Types
export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  sender: Employee;
  receiver: Employee;
}

export enum MessageType {
  Text = 1,
  MeetingScheduled = 2,
  SystemNotification = 3
}

// Feedback Types
export interface MatchFeedback {
  id: string;
  matchId: string;
  providedById: string;
  overallRating: number;
  communicationRating: number;
  helpfulnessRating: number;
  cultureIntegrationRating: number;
  comments: string;
  improvements: string;
  wouldRecommend: boolean;
  createdAt: string;
  averageRating: number;
  isPositiveFeedback: boolean;
  isExcellentFeedback: boolean;
}

// API Request Types
export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  unit: string;
  team: string;
  location: string;
  startDate: string;
  role: EmployeeRole;
  techStack?: string;
  languages?: string;
  interests?: string;
}


export interface CreateMatchRequest {
  buddyId: string;
  newcomerId: string;
  hrId: string;
  notes?: string;
  compatibilityScore?: number;
}

export interface BuddyMatchRecommendation {
  buddyId: string;
  buddyName: string;
  title: string;
  unit: string;
  location: string;
  compatibilityScore: number;
  currentActiveBuddies: number;
  maxActiveBuddies: number;
  canAcceptNewBuddy: boolean;
  matchingTechStack: string[];
  matchingInterests: string[];
  reasonForRecommendation: string;
}

// UI State Types
export interface UserContext {
  currentUser: Employee | null;
  setCurrentUser: (user: Employee | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Analytics Types
export interface AnalyticsData {
  totalEmployees: number;
  totalBuddies: number;
  totalNewcomers: number;
  activeMatches: number;
  pendingMatches: number;
  completedMatches: number;
  averageCompatibilityScore: number;
  topPerformingBuddies: Employee[];
  matchingTrends: MatchingTrend[];
  departmentStats: DepartmentStat[];
}

export interface MatchingTrend {
  date: string;
  matches: number;
  acceptanceRate: number;
}

export interface DepartmentStat {
  department: string;
  buddyCount: number;
  newcomerCount: number;
  matchingRate: number;
}

// Buddy Profile Request Types
export interface CreateBuddyProfileRequest {
  bio: string;
  specialties: string;
  buddyLocation?: string;
  buddyUnit?: string;
  buddyTechStack?: string;
  interests?: string;
  availability: BuddyAvailability;
  maxActiveBuddies: number;
  isActive: boolean;
}

export interface UpdateBuddyProfileRequest {
  bio?: string;
  specialties?: string;
  buddyLocation?: string;
  buddyUnit?: string;
  buddyTechStack?: string;
  interests?: string;
  availability?: BuddyAvailability;
  maxActiveBuddies?: number;
  isActive?: boolean;
}
