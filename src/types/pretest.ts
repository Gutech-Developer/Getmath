/**
 * Pretest Types (SDQ - Strengths and Difficulties Questionnaire)
 * Sesuai dengan backend pretest model
 */

export interface IPretest {
  _id: string;
  therapyId: string;
  totalDifficultiesScore: number;
  totalDifficultiesInterpretation: string;
  emotionalSymptomsScore: number;
  emotionalSymptomsInterpretation: string;
  conductProblemScore: number;
  conductProblemInterpretation: string;
  hyperactivityScore: number;
  hyperactivityInterpretation: string;
  peerProblemScore: number;
  peerProblemInterpretation: string;
  prosocialBehaviourScore: number;
  prosocialBehaviourInterpretation: string;
  totalPretestScore: number;
  totalPretestInterpretation: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePretestInput {
  therapyId: string;
  totalDifficultiesScore: number;
  totalDifficultiesInterpretation: string;
  emotionalSymptomsScore: number;
  emotionalSymptomsInterpretation: string;
  conductProblemScore: number;
  conductProblemInterpretation: string;
  hyperactivityScore: number;
  hyperactivityInterpretation: string;
  peerProblemScore: number;
  peerProblemInterpretation: string;
  prosocialBehaviourScore: number;
  prosocialBehaviourInterpretation: string;
  totalPretestScore: number;
  totalPretestInterpretation: string;
}

export interface IUpdatePretestInput {
  therapyId?: string;
  totalDifficultiesScore?: number;
  totalDifficultiesInterpretation?: string;
  emotionalSymptomsScore?: number;
  emotionalSymptomsInterpretation?: string;
  conductProblemScore?: number;
  conductProblemInterpretation?: string;
  hyperactivityScore?: number;
  hyperactivityInterpretation?: string;
  peerProblemScore?: number;
  peerProblemInterpretation?: string;
  prosocialBehaviourScore?: number;
  prosocialBehaviourInterpretation?: string;
  totalPretestScore?: number;
  totalPretestInterpretation?: string;
}
