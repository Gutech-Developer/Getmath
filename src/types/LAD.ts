import { GsPaginationMeta } from "./gs-course";

export interface ICourseSummaryResponse {
    courseId: string;
    courseName: string;
    progressPercent: number;
    totalStudyTimeMs: number;
    completedMaterials: number;
    totalMaterials: number;
}

export interface IEmotionDistributionResponse{
    courseId: string;
    moduleLearning: {
      totalSamples: number;
      dominant: string;
      distribution: {
        neutral: number;
        happy: number;
        sad: number;
        angry: number;
        fearful: number;
        disgusted: number;
        surprised: number;
      }
    },
    remedial: {
      totalSamples: number;
      dominant: string;
      distribution: {
        neutral: number;
        happy: number;
        sad: number;
        angry: number;
        fearful: number;
        disgusted: number;
        surprised: number;
      }
    }
}

export interface IEmotionDistributionClassOverallResponse{
    courseId: string;
    moduleLearning: {
      totalSamples: number;
      dominant: string;
      distribution: {
        neutral: number;
        happy: number;
        sad: number;
        angry: number;
        fearful: number;
        disgusted: number;
        surprised: number;
      }
    },
    remedial: {
      totalSamples: number;
      dominant: string;
      distribution: {
        neutral: number;
        happy: number;
        sad: number;
        angry: number;
        fearful: number;
        disgusted: number;
        surprised: number;
      }
    }
}

export interface IStudyTimeByModule {
    courseModuleId: string;
    order: number;
    subjectName: string;
    studyTimeMs: number;
    totalSamples: number;
    dominant: string;
    distribution: {
        neutral: number;
        happy: number;
        sad: number;
        angry: number;
        fearful: number;
        disgusted: number;
        surprised: number;
    }
}

export type IStudyTimeByModuleResponse = IStudyTimeByModule[] | {
    data: IStudyTimeByModule[];
};

export interface IActivityLog {
    id: string;
    action: string;
    createdAt: string;
    courseId?: string;
    courseName?: string;
    courseModuleId?: string;
    moduleName?: string;
    metadata?: Record<string, any>;
}

export interface IActivityLogResponse {
    logs: IActivityLog[];
    pagination: GsPaginationMeta;
}

export interface IDistributionTest{
  courseId: string;
  totalSamples: number;
  averageScore: number;
  buckets: {
      range: "0-20" | "21-40" | "41-60" | "61-80" | "81-100";
      count: number;
      }[];
}

export type IDistributionDiagnosticTestResponse = IDistributionTest | {
    data: IDistributionTest;
};

export type IDistributionRemedialResponse = IDistributionTest | {
    data: IDistributionTest;
};
