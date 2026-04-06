/**
 * Therapy Types
 * Sesuai dengan backend therapy model
 */

export interface ITherapy {
  _id: string;
  counselorId: string;
  childId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTherapyInput {
  counselorId: string;
  childId: string;
}

export interface IUpdateTherapyInput {
  counselorId?: string;
  childId?: string;
}
