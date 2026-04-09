export interface IClassDiagnosisContentPageTemplateProps {
  slug: string;
  contentId: string;
  diagnotisId: string;
}

export interface IDiagnosticOption {
  id: string;
  label: string;
  text: string;
}

export interface IDiagnosticQuestion {
  id: string;
  topic: string;
  typeLabel: string;
  difficulty?: string;
  prompt: string;
  options: IDiagnosticOption[];
  correctOptionId: string;
  discussion: string;
}

export type DiagnosticFlowStep = "camera" | "briefing" | "quiz" | "completed";

export type CameraPermissionState =
  | "idle"
  | "requesting"
  | "granted"
  | "denied";
