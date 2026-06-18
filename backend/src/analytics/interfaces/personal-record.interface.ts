import { PersonalRecordType } from "@/analytics/enums/personal-record-type.enum";

export interface PersonalRecord {
  type: PersonalRecordType;
  value: number;
  achievedAt: string | null;
  exerciseId?: string;
  sessionId?: string;
}
