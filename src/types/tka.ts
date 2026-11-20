import type {
  EmotionDistribution,
  EmotionInput,
  EmotionLabel,
} from "@/libs/emotion/types";
import type { GsPaginationMeta } from "./gs-course";

export type {
  EmotionDistribution,
  EmotionInput,
  EmotionLabel,
} from "@/libs/emotion/types";

export type TKAStatus = "DRAFT" | "AVAILABLE" | "COMPLETED";

export type TKAQuestionType =
  | "MULTIPLE_CHOICE"
  | "MCMA"
  | "COMPLEX_TRUE_FALSE";

export type TKAAttemptStatus = "IN_PROGRESS" | "COMPLETED";

export type TKASubmissionType = "MANUAL" | "AUTO_TIMEOUT";

export type TKAStudentListStatusFilter =
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "COMPLETED";

export type TKAAnalyticsStatusFilter = "ALL" | "COMPLETED" | "IN_PROGRESS";

export interface TKAQuestionOption {
  id: string;
  tkaQuestionId: string;
  orderNumber: number;
  label: string;
  optionText: string;
  isCorrect: boolean;
}

export interface TKAQuestionStatement {
  id: string;
  tkaQuestionId: string;
  orderNumber: number;
  statementText: string;
  isTrue: boolean;
}

export interface TKAQuestion {
  id: string;
  tkaTestId: string;
  questionNumber: number;
  questionType: TKAQuestionType;
  questionText: string;
  options?: TKAQuestionOption[];
  statements?: TKAQuestionStatement[];
}

export interface TKATestSummary {
  id: string;
  schoolId: string;
  schoolName: string;
  teacherId?: string;
  teacherName?: string;
  title: string;
  description?: string;
  schoolYear?: string;
  durationMinutes: number;
  status: TKAStatus;
  accessCode: string;
  startAt?: string;
  endAt?: string;
  totalQuestions: number;
  pointsPerQuestion: number;
  createdAt: string;
  updatedAt: string;
}

export interface TKAStatusCounts {
  total: number;
  available: number;
  draft: number;
  completed: number;
}

export interface TKATestListResult {
  tests: TKATestSummary[];
  counts: TKAStatusCounts;
  pagination: GsPaginationMeta;
}

export interface TKATestDetailResult extends TKATestSummary {
  questions: TKAQuestion[];
}

export interface TKAOptionInput {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

export interface TKAStatementInput {
  id?: string;
  statementText: string;
  isTrue: boolean;
}

export interface TKAQuestionInput {
  id?: string;
  questionNumber?: number;
  questionType: TKAQuestionType;
  questionText: string;
  options?: TKAOptionInput[];
  statements?: TKAStatementInput[];
}

export interface CreateTKATestInput {
  schoolId?: string;
  teacherId?: string;
  title: string;
  description?: string;
  schoolYear?: string;
  durationMinutes: number;
  status?: "DRAFT" | "AVAILABLE";
  accessCode?: string;
  startAt?: string;
  endAt?: string;
  questions?: TKAQuestionInput[];
}

export interface UpdateTKATestInput {
  title?: string;
  description?: string | null;
  schoolYear?: string | null;
  durationMinutes?: number;
  status?: TKAStatus;
  accessCode?: string;
  startAt?: string;
  endAt?: string;
  questions?: TKAQuestionInput[];
}

export interface ListTKATestsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TKAStatus;
  schoolId?: string;
  teacherId?: string;
}

export interface AssignTKATestInput {
  schoolId?: string;
  teacherId?: string | null;
}

export interface DuplicateTKATarget {
  schoolId: string;
  teacherId?: string;
}

export interface DuplicateTKATestInput {
  targets: DuplicateTKATarget[];
}

export interface TKAStudentOptionDTO {
  id: string;
  orderNumber: number;
  label: string;
  optionText: string;
}

export interface TKAStudentStatementDTO {
  id: string;
  orderNumber: number;
  statementText: string;
}

export interface TKAStudentQuestionDTO {
  id: string;
  questionNumber: number;
  questionType: TKAQuestionType;
  questionText: string;
  options?: TKAStudentOptionDTO[];
  statements?: TKAStudentStatementDTO[];
}

export interface TKAStatementAnswerEntry {
  statementId: string;
  isTrue: boolean;
}

export interface TKAStudentSavedAnswerDTO {
  questionId: string;
  selectedOptionIds: string[];
  statementAnswers: TKAStatementAnswerEntry[];
  isDoubtful: boolean;
}

export interface TKAStudentListItem {
  id: string;
  title: string;
  description?: string;
  schoolYear?: string;
  schoolId: string;
  schoolName: string;
  teacherName?: string;
  durationMinutes: number;
  totalQuestions: number;
  pointsPerQuestion: number;
  status: TKAStatus;
  startAt?: string;
  endAt?: string;
  attemptStatus?: TKAAttemptStatus;
  remainingSeconds?: number;
  myScore?: number;
  completedAt?: string;
}

export interface TKAStudentListResult {
  tests: TKAStudentListItem[];
  pagination: GsPaginationMeta;
}

export interface TKAStudentSessionResponse {
  attemptId: string;
  tkaTestId: string;
  title: string;
  schoolName: string;
  schoolYear?: string;
  durationMinutes: number;
  totalQuestions: number;
  pointsPerQuestion: number;
  startedAt: string;
  effectiveDeadlineAt: string;
  remainingSeconds: number;
  questions: TKAStudentQuestionDTO[];
  savedAnswers: TKAStudentSavedAnswerDTO[];
}

export interface TKAStudentSaveAnswerResponse {
  attemptId: string;
  questionId: string;
  isDoubtful: boolean;
  remainingSeconds: number;
  savedAt: string;
}

export interface TKAStudentResultSummary {
  attemptId: string;
  tkaTestId: string;
  title: string;
  schoolName: string;
  schoolYear?: string;
  studentName: string;
  nis?: string;
  durationMinutes: number;
  totalQuestions: number;
  pointsPerQuestion: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  unansweredQuestionNumbers: number[];
  startedAt: string;
  completedAt: string;
  submissionType: TKASubmissionType;
  emotionRecorded: boolean;
  emotionDominant?: EmotionLabel;
  emotionTotalSamples: number;
}

export interface ListStudentTKAsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TKAStudentListStatusFilter;
}

export interface StartTKAAttemptInput {
  accessCode: string;
  cameraConsent: true;
  deviceInfo?: string;
}

export interface SaveTKAStatementAnswerInput {
  statementId: string;
  isTrue: boolean;
}

export interface SaveTKAAnswerInput {
  questionId: string;
  selectedOptionIds?: string[];
  statementAnswers?: SaveTKAStatementAnswerInput[];
  isDoubtful?: boolean;
}

export interface SubmitTKAAttemptInput {
  isAutoSubmit?: boolean;
  answers?: SaveTKAAnswerInput[];
}

export interface SubmitTKAEmotionBucketInput {
  emotion: EmotionInput;
}

export interface TKAAnalyticsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TKAAnalyticsStatusFilter;
}

export interface TKAAnalyticsOverview {
  joinedCount: number;
  completedCount: number;
  inProgressCount: number;
  schoolTotalStudents: number;
  completionRate: number;
  averageScore: number;
  averageAnsweredCount: number;
  totalQuestions: number;
}

export interface TKAScoreBucket {
  label: "0-25" | "26-50" | "51-75" | "76-100" | string;
  minScore: number;
  maxScore: number;
  count: number;
  percentage: number;
}

export interface TKAQuestionTypeStat {
  questionType: TKAQuestionType;
  questionCount: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  accuracyRate: number;
}

export interface TKAQuestionStat {
  questionId: string;
  questionNumber: number;
  questionType: TKAQuestionType;
  questionText: string;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  accuracyRate: number;
}

export interface TKAEmotionAggregate {
  totalBuckets: number;
  totalSamples: number;
  totalDurationMs: number;
  participantsWithEmotion: number;
  dominant: EmotionLabel;
  distribution: EmotionDistribution;
}

export interface TKAStudentAnalyticsRow {
  attemptId: string;
  studentId: string;
  studentName: string;
  nis?: string;
  status: TKAAttemptStatus;
  startedAt: string;
  completedAt?: string;
  submissionType?: TKASubmissionType;
  score?: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
  dominantEmotion?: EmotionLabel;
  emotionSampleCount: number;
}

export interface TKAAnalyticsResponse {
  test: TKATestSummary;
  overview: TKAAnalyticsOverview;
  scoreDistribution: TKAScoreBucket[];
  questionTypeStats: TKAQuestionTypeStat[];
  questionStats: TKAQuestionStat[];
  emotionAnalytics: TKAEmotionAggregate;
  students: TKAStudentAnalyticsRow[];
  pagination: GsPaginationMeta;
}

export interface TKAQuestionDetailForTeacher {
  questionId: string;
  questionNumber: number;
  questionType: TKAQuestionType;
  questionText: string;
  isAnswered: boolean;
  isCorrect: boolean;
  isDoubtful: boolean;
  pointsEarned: number;
  maxPoints: number;
  selectedOptionIds: string[];
  statementAnswers: TKAStatementAnswerEntry[];
  options?: TKAQuestionOption[];
  statements?: TKAQuestionStatement[];
}

export interface TKAStudentAttemptDetailResponse {
  attemptId: string;
  tkaTestId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  nis?: string;
  status: TKAAttemptStatus;
  startedAt: string;
  completedAt?: string;
  submissionType?: TKASubmissionType;
  score?: number;
  totalQuestions: number;
  pointsPerQuestion: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  emotionSummary: TKAEmotionAggregate;
  questions: TKAQuestionDetailForTeacher[];
}
