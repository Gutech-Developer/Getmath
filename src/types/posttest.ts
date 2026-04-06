/**
 * Posttest Types (SDQ - Strengths and Difficulties Questionnaire)
 * Sesuai dengan backend posttest model
 * Structure sama dengan Pretest
 */

export interface IPosttest {
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
  totalPosttestScore: number;
  totalPosttestInterpretation: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePosttestInput {
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
  totalPosttestScore: number;
  totalPosttestInterpretation: string;
}

export interface IUpdatePosttestInput {
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
  totalPosttestScore?: number;
  totalPosttestInterpretation?: string;
}
