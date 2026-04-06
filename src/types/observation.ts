/**
 * Observation Types
 * Sesuai dengan backend observation model
 */

export interface IObservation {
  _id: string;
  therapyId: string;
  sessionOne: string;
  sessionTwo: string;
  sessionThree: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateObservationInput {
  therapyId: string;
  sessionOne: string;
  sessionTwo: string;
  sessionThree: string;
  summary: string;
}

export interface IUpdateObservationInput {
  therapyId?: string;
  sessionOne?: string;
  sessionTwo?: string;
  sessionThree?: string;
  summary?: string;
}
