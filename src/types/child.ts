/**
 * Child Types
 * Sesuai dengan backend child model
 */

export interface IChildEducation {
  stage: "SD" | "SMP" | "SMA";
  class: number;
}

export interface IChild {
  _id: string;
  parentId: string;
  fullname: string;
  nik: string;
  age: number;
  biologicalMotherName: string;
  birth: string; // ISO date string
  childOrder: number;
  education: IChildEducation;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateChildInput {
  fullname: string;
  nik: string;
  age: number;
  biologicalMotherName: string;
  birth: string; // ISO date string atau Date object
  childOrder: number;
  education: IChildEducation;
}

export interface IUpdateChildInput {
  fullname?: string;
  nik?: string;
  age?: number;
  biologicalMotherName?: string;
  birth?: string;
  childOrder?: number;
  education?: IChildEducation;
}
