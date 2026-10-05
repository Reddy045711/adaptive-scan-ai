/**
 * Adaptive Scan AI - Types and Interfaces
 * Clinical Decision Support System
 */

import { NvidiaBraTSResult } from '../services/nvidiaResultService';

export type AssistanceMode = 'focused' | 'explain' | 'review';

export type QualityStatus = 'ready' | 'review_required' | 'pending';
export type AIStatus = 'analyzed' | 'inference_withheld' | 'pending' | 'analyzing' | 'unavailable';
export type ClinicianStatus = 'pending' | 'accepted' | 'corrected' | 'rejected' | 'overridden' | 'escalated';

export interface QualityCheck {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  detail: string;
  badgeText: string;
  critical?: boolean;
}

export interface ScanQualityResult {
  status: QualityStatus;
  qualityScore: number;
  toleranceThreshold: number;
  checks: QualityCheck[];
  issues: string[];
  inferenceAllowed: boolean;
  samplingVoxels: number;
  technicalMetadata: {
    matrixDimensions: string;
    magneticFieldStrength: string;
    sliceThickness: string;
    pixelBandwidth: string;
    flipAngle: string;
    scannerManufacturer: string;
    calibrationCode: string;
    studyUid: string;
    seriesId: string;
  };
  rationale: string;
  artifactDetails?: {
    corruptedSlices: string;
    phaseVector: string;
    ghostingEntropy: number;
    ghostingRatio: number;
    discardedRange: string;
  };
}

export interface AIFinding {
  id: string;
  title: string;
  modelName: string;
  confidence: number | null;
  confidenceTier: string;
  whyItMatters: string;
  evidence: {
    regionCharacteristics: string;
    signalMeasurements: string;
    morphologicalContext: string;
  };
  limitations: string;
  explanation: {
    whatWasDetected: string;
    whatInfluencedResult: string;
    whatCouldMakeItWrong: string;
  };
  rawVolumetricCm3: number;
  centroidCoords: string;
  gradCamPeak: string;
  isDemoOutput: boolean;
}

export interface ClinicianDecision {
  action: 'accept' | 'correct' | 'reject';
  clinicianName: string;
  clinicianRole: string;
  timestamp: string;
  note?: string;
  rejectionReason?: string;
  correctedMarginCm3?: number;
  signatureHash: string;
}

export interface DecisionLogEvent {
  id: string;
  caseId: string;
  timestamp: string;
  type: 'upload' | 'quality_check' | 'mode_selected' | 'ai_inference' | 'explanation_viewed' | 'clinician_review' | 'ratified' | 'escalation' | 'intercept';
  title: string;
  description: string;
  details?: Record<string, any>;
  badge?: string;
  badgeType?: 'primary' | 'error' | 'secondary' | 'neutral';
  clinicianName?: string;
  hash?: string;
}

export interface Case {
  id: string;
  mrn: string;
  scanType: string;
  anatomy: string;
  clinicalTask: string;
  acquisitionProtocol: string;
  dataSource: string;
  qualityStatus: QualityStatus;
  qualityScore: number;
  aiStatus: AIStatus;
  confidence: number | null;
  clinicianStatus: ClinicianStatus;
  lastUpdated: string;
  createdAt: string;
  assistanceMode: AssistanceMode;
  fileName: string;
  fileSize: string;
  voxelDims: string;
  isPriority?: boolean;
  priorityNote?: string;
  qualityResult?: ScanQualityResult;
  aiFinding?: AIFinding;
  nvidiaResult?: NvidiaBraTSResult;
  clinicianDecision?: ClinicianDecision;
}

export interface AppSettings {
  defaultAssistanceMode: AssistanceMode;
  explanationDetailLevel: 'standard' | 'granular' | 'raw';
  lowQualityAudioAlert: boolean;
  technicalLeadDigest: boolean;
  technicalLeadEmail: string;
  dicomScrubberActive: boolean;
  zeroDataRetention: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'clinician' | 'ai';
  text: string;
  timestamp: string;
}
