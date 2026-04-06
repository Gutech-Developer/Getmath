/**
 * Screening Types (CSTQ - Child Screening Trauma Questionnaire)
 * Sesuai dengan backend screening model
 */

export interface IScreening {
  _id: string;
  therapyId: string;
  screeningScore: number;
  counselorInterpretation: string;
  parentInterpretation: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateScreeningInput {
  therapyId: string;
  screeningScore: number;
}

export interface IUpdateScreeningInput {
  therapyId?: string;
  screeningScore?: number;
}
