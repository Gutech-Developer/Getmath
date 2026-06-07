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