export enum StructureMode {
  LINEAR = 'LINEAR',
  FREE_FLEXIBLE = 'FREE_FLEXIBLE'
}

export enum LearningUnitType {
  VIDEO = 'VIDEO',
  NOTES = 'NOTES',
  ASSESSMENT = 'ASSESSMENT',
  ASSIGNMENT = 'ASSIGNMENT'
}

export interface VideoContentData {
  vdo_cipher_id: string;
  duration_seconds?: number;
}

export interface NotesContentData {
  rich_text_content: string;
}

export interface AssessmentContentData {
  assessment_id: string;
  passing_score: number;
}

export interface AssignmentContentData {
  instructions: string;
  file_attachment_url?: string;
  max_score: number;
}

export type ContentData = 
  | VideoContentData 
  | NotesContentData 
  | AssessmentContentData 
  | AssignmentContentData;

export interface LearningUnit {
  id: string;
  module_id: string;
  title: string;
  type: LearningUnitType;
  content_data: ContentData;
  order_index: number;
  prerequisite_unit_id?: string | null;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  unlock_days: number;
  units?: LearningUnit[];
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  validity_days: number;
  structure_mode: StructureMode;
  is_published: boolean;
  thumbnail_url?: string;
  modules?: Module[];
}
