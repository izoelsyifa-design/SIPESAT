export type SupervisorLevel = "Ahli Muda" | "Ahli Madya";
export type InstrumentType = "Akademik" | "Manajerial";

export interface AssessmentMetadata {
  id: string;
  supervisorName: string;
  supervisorNip: string;
  supervisorLevel: SupervisorLevel;
  supervisorUnit: string;
  supervisorWilayah: string;
  schoolName: string;
  schoolNpsn: string;
  schoolAddress: string;
  schoolRombel?: string;
  
  // Specific to Akademik
  teacherName?: string;
  teacherNip?: string;
  subjectOrClass?: string;
  teacherLevel?: string;
  certified?: "Sudah" | "Belum";
  teachingHours?: string;
  
  // Specific to Manajerial
  principalName?: string;
  principalNip?: string;
  principalEducation?: string;
  principalTenure?: string;
  principalLevel?: string;

  observationDate: string;
  createdAt: string;
}

export interface ActionPlanItem {
  id: string;
  plan: string;
  strategy: string;
  pic: string;
  targetTime: string;
  successIndicator: string;
}

export interface Assessment {
  id: string;
  type: InstrumentType;
  metadata: AssessmentMetadata;
  scores: Record<number, number>; // item number -> score (1-4)
  notes: Record<string, string>; // category key -> notes
  strengths: string;
  developments: string;
  actionPlan: ActionPlanItem[];
  finalScore: number;
  finalCategory: string; // "A (Sangat Baik)" | "B (Baik)" | "C (Cukup)" | "D (Kurang)"
  notified: boolean;
  notifiedAt?: string;
}

export interface NotificationLog {
  id: string;
  assessmentId: string;
  schoolName: string;
  targetName: string;
  type: InstrumentType;
  score: number;
  category: string;
  sentAt: string;
  channel: "Email" | "Sistem";
  status: "Success" | "Pending";
  message: string;
}
