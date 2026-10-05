/**
 * Adaptive Scan AI - AI Inference & Explainability Service
 *
 * Integrates the real NVIDIA BraTS MRI segmentation result.
 * Labeled explicitly as "NVIDIA BraTS Segmentation — Demo Result".
 * Strictly honors the pre-inference Quality Gate.
 */

import { AIFinding, AssistanceMode } from '../types';
import { REAL_NVIDIA_BRATS_RESULT, NvidiaBraTSResult } from './nvidiaResultService';

export interface AIAnalysisRequest {
  caseId: string;
  scanType: string;
  clinicalTask: string;
  assistanceMode: AssistanceMode;
  inferenceAllowed: boolean;
}

export interface AIAnalysisResponse {
  success: boolean;
  error?: string;
  finding?: AIFinding;
  nvidiaResult?: NvidiaBraTSResult;
  isDemoOutput: boolean;
  analyzedAt: string;
}

/**
 * Real NVIDIA BraTS finding integration
 */
export const DEFAULT_AI_FINDING: AIFinding = {
  id: 'NVIDIA-BRATS-00495',
  title: 'Automated MRI segmentation identified distinct tumor-associated regions for clinician review.',
  modelName: 'NVIDIA BraTS Segmentation Model',
  confidence: null, // Dice scores are evaluation metrics, NOT patient-specific confidence
  confidenceTier: 'Research Evaluation (BraTS Single Case)',
  whyItMatters: REAL_NVIDIA_BRATS_RESULT.why_it_matters,
  evidence: {
    regionCharacteristics: `Whole Tumor: ${REAL_NVIDIA_BRATS_RESULT.evidence.whole_tumor_volume_ml} mL · Tumor Core: ${REAL_NVIDIA_BRATS_RESULT.evidence.tumor_core_volume_ml} mL · Enhancing Tumor: ${REAL_NVIDIA_BRATS_RESULT.evidence.enhancing_tumor_volume_ml} mL`,
    signalMeasurements: `FLAIR Slice ${REAL_NVIDIA_BRATS_RESULT.visual_evidence.slice}: ${REAL_NVIDIA_BRATS_RESULT.visual_evidence.tumor_voxels_on_slice.toLocaleString()} tumor voxels on representative slice`,
    morphologicalContext:
      'Segmented regions comprise Whole Tumor, Tumor Core, and Enhancing Tumor sub-compartments.',
  },
  limitations: REAL_NVIDIA_BRATS_RESULT.limitations.join(' '),
  explanation: {
    whatWasDetected:
      'Automated voxel-wise classification identified multi-compartment neoplastic tissue (Whole Tumor, Tumor Core, Enhancing Tumor).',
    whatInfluencedResult:
      'Spatial voxel intensity profiles across multi-parametric MRI sequences with representative activation on FLAIR Slice 87.',
    whatCouldMakeItWrong:
      'Model was trained on BraTS 2018 data; atypical contrast enhancement or non-standard slice orientation may alter boundary delineation.',
  },
  rawVolumetricCm3: REAL_NVIDIA_BRATS_RESULT.evidence.whole_tumor_volume_ml,
  centroidCoords: '[Slice: 87, Region: Fronto-Temporal]',
  gradCamPeak: 'Voxel count: 2,007 on Slice 87',
  isDemoOutput: true,
};

/**
 * Executes scan analysis through the clinical decision-support pipeline
 */
export async function analyzeScan(
  request: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  // CRITICAL SAFETY GATE: Block inference if gate tripped
  if (!request.inferenceAllowed) {
    return {
      success: false,
      error:
        'Analysis withheld — scan quality is insufficient for reliable model inference. Human review is required.',
      isDemoOutput: true,
      analyzedAt: new Date().toISOString(),
    };
  }

  // Simulate pipeline latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    finding: {
      ...DEFAULT_AI_FINDING,
      id: `NVIDIA-BRATS-${request.caseId.replace('#', '').replace('Case ', '')}`,
    },
    nvidiaResult: REAL_NVIDIA_BRATS_RESULT,
    isDemoOutput: true,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Answers clinician questions about the NVIDIA BraTS finding
 * Scope: Strictly Decision-Support & Feature Attribution
 */
export function queryAIExplainer(
  userQuery: string,
  _finding?: AIFinding
): string {
  const q = userQuery.toLowerCase();
  const res = REAL_NVIDIA_BRATS_RESULT;

  if (q.includes('volume') || q.includes('size') || q.includes('region') || q.includes('whole')) {
    return `Quantitative segmentation volumes: Whole Tumor: ${res.evidence.whole_tumor_volume_ml} mL, Tumor Core: ${res.evidence.tumor_core_volume_ml} mL, Enhancing Tumor: ${res.evidence.enhancing_tumor_volume_ml} mL.`;
  }

  if (q.includes('dice') || q.includes('metric') || q.includes('score') || q.includes('evaluation') || q.includes('ground truth')) {
    return `Model Evaluation (Single Case BraTS2021_00495): Whole Tumor Dice: ${res.model_evaluation.whole_tumor_dice}, Tumor Core Dice: ${res.model_evaluation.tumor_core_dice}, Enhancing Tumor Dice: ${res.model_evaluation.enhancing_tumor_dice}. Note: Dice scores are evaluation metrics and are not patient-specific confidence scores.`;
  }

  if (q.includes('slice') || q.includes('visual') || q.includes('voxel') || q.includes('flair')) {
    return `Visual evidence: Evaluated on ${res.visual_evidence.modality} modality, representative Slice ${res.visual_evidence.slice}, with ${res.visual_evidence.tumor_voxels_on_slice.toLocaleString()} tumor voxels identified on this slice.`;
  }

  if (q.includes('limitation') || q.includes('caution') || q.includes('risk') || q.includes('wrong')) {
    return `Key limitations: ${res.limitations.join(' ')} ${res.recommended_action}`;
  }

  if (q.includes('recommend') || q.includes('action') || q.includes('next')) {
    return `${res.recommended_action}`;
  }

  return `NVIDIA BraTS Segmentation output: ${res.finding} Whole tumor volume is ${res.evidence.whole_tumor_volume_ml} mL. ${res.recommended_action}`;
}
