/**
 * NVIDIA BraTS MRI Segmentation Result Service
 *
 * Exposes the real NVIDIA BraTS automated segmentation demo output.
 * Preserves exact numerical outputs, region definitions, single-case evaluation metrics, and limitations.
 */

export interface NvidiaBraTSEvidence {
  whole_tumor_volume_ml: number;
  tumor_core_volume_ml: number;
  enhancing_tumor_volume_ml: number;
  segmentation_regions: string[];
}

export interface NvidiaBraTSVisualEvidence {
  modality: string;
  slice: number;
  tumor_voxels_on_slice: number;
  segmentation_overlay: boolean;
}

export interface NvidiaBraTSModelEvaluation {
  whole_tumor_dice: number;
  tumor_core_dice: number;
  enhancing_tumor_dice: number;
  evaluation_case: string;
  evaluation_type: string;
}

export interface NvidiaBraTSResult {
  status: 'analysis_complete';
  finding: string;
  evidence: NvidiaBraTSEvidence;
  visual_evidence: NvidiaBraTSVisualEvidence;
  model_evaluation: NvidiaBraTSModelEvaluation;
  why_it_matters: string;
  limitations: string[];
  recommended_action: string;
}

export const REAL_NVIDIA_BRATS_RESULT: NvidiaBraTSResult = {
  status: 'analysis_complete',
  finding: 'Automated MRI segmentation identified distinct tumor-associated regions for clinician review.',
  evidence: {
    whole_tumor_volume_ml: 94.97,
    tumor_core_volume_ml: 52.18,
    enhancing_tumor_volume_ml: 28.47,
    segmentation_regions: [
      'Whole Tumor',
      'Tumor Core',
      'Enhancing Tumor',
    ],
  },
  visual_evidence: {
    modality: 'FLAIR',
    slice: 87,
    tumor_voxels_on_slice: 2007,
    segmentation_overlay: true,
  },
  model_evaluation: {
    whole_tumor_dice: 0.9513,
    tumor_core_dice: 0.9584,
    enhancing_tumor_dice: 0.8722,
    evaluation_case: 'BraTS2021_00495',
    evaluation_type: 'Single-case comparison against provided ground truth.',
  },
  why_it_matters:
    'The segmentation provides quantitative estimates of the spatial extent of segmented regions and can assist a clinician during image review.',
  limitations: [
    'This is an automated research/demo segmentation.',
    'Dice scores are evaluation metrics and are not patient-specific confidence scores.',
    'The NVIDIA model was trained for BraTS 2018 and evaluated here on a BraTS 2021 case.',
    'Segmentation alone does not establish a clinical diagnosis.',
    'Final interpretation must be performed by a qualified clinician.',
  ],
  recommended_action:
    'Review the segmentation overlay against the original MRI before accepting the AI suggestion.',
};

/**
 * Returns the verified NVIDIA BraTS segmentation output
 */
export function getNvidiaBraTSResult(): NvidiaBraTSResult {
  return REAL_NVIDIA_BRATS_RESULT;
}
