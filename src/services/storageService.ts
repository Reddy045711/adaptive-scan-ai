/**
 * Adaptive Scan AI - Local Persistent Storage Service
 *
 * Persists active cases, decisions, and audit events in browser localStorage.
 * Pre-populates realistic clinical demo data matching the Stitch design.
 */

import { Case, DecisionLogEvent, AppSettings } from '../types';
import { getQualityResultForCase } from './qualityService';
import { DEFAULT_AI_FINDING } from './aiService';
import { REAL_NVIDIA_BRATS_RESULT } from './nvidiaResultService';

const STORAGE_KEY_CASES = 'adaptive_scan_cases_v1';
const STORAGE_KEY_LOGS = 'adaptive_scan_decision_logs_v1';
const STORAGE_KEY_SETTINGS = 'adaptive_scan_settings_v1';

export const INITIAL_SETTINGS: AppSettings = {
  defaultAssistanceMode: 'explain',
  explanationDetailLevel: 'granular',
  lowQualityAudioAlert: true,
  technicalLeadDigest: true,
  technicalLeadEmail: 'lead-radiologist@acuity-health.internal',
  dicomScrubberActive: true,
  zeroDataRetention: true,
};

export const INITIAL_CASES: Case[] = [
  {
    id: 'Case #1042',
    mrn: 'MRN: 8820-91B',
    scanType: 'MRI Brain (T1/T2 Axial)',
    anatomy: 'Brain / Neuro',
    clinicalTask: 'Ischemic stroke evaluation / space occupying lesion',
    acquisitionProtocol: '3.0T MRI · Siemens Magnetom Skyra',
    dataSource: 'PACS Archive - Neuro Suite 4',
    qualityStatus: 'ready',
    qualityScore: 86,
    aiStatus: 'analyzed',
    confidence: null, // Dice scores are evaluation metrics on BraTS dataset, not patient-specific confidence
    clinicianStatus: 'pending',
    lastUpdated: '12 mins ago',
    createdAt: 'Today, 08:42 EST',
    assistanceMode: 'explain',
    fileName: 'brain_t1_t2_flair_deidentified_vol01.nii.gz',
    fileSize: '44.8 MB',
    voxelDims: '256x256x176 voxels',
    qualityResult: getQualityResultForCase('Case #1042'),
    aiFinding: DEFAULT_AI_FINDING,
    nvidiaResult: REAL_NVIDIA_BRATS_RESULT,
  },
  {
    id: 'Case #1039',
    mrn: 'MRN: 4712-33X',
    scanType: 'MRI Brain (FLAIR)',
    anatomy: 'Brain / Neuro',
    clinicalTask: 'Acute headache / subacute trauma protocol',
    acquisitionProtocol: '3.0T MRI · GE Signa Premier',
    dataSource: 'Emergency Trauma Feed (Fast-Track)',
    qualityStatus: 'review_required',
    qualityScore: 42,
    aiStatus: 'inference_withheld',
    confidence: null,
    clinicianStatus: 'escalated',
    lastUpdated: '34 mins ago',
    createdAt: 'Today, 07:15 EST',
    assistanceMode: 'explain',
    fileName: 'brain_flair_motion_degraded_vol03.nii.gz',
    fileSize: '32.1 MB',
    voxelDims: '256x256x64 voxels',
    isPriority: true,
    priorityNote: 'FLAIR sequence contains significant patient translation artifacts across axial slices 18–26.',
    qualityResult: getQualityResultForCase('Case #1039'),
  },
  {
    id: 'Case #1036',
    mrn: 'MRN: 9021-14C',
    scanType: 'MRI Brain (Diffusion DWI)',
    anatomy: 'Brain / Neuro',
    clinicalTask: 'TIA follow-up / cytotoxic edema verification',
    acquisitionProtocol: '1.5T MRI · Philips Ingenia',
    dataSource: 'PACS Archive - Neuro Suite 2',
    qualityStatus: 'ready',
    qualityScore: 91,
    aiStatus: 'analyzed',
    confidence: 74,
    clinicianStatus: 'accepted',
    lastUpdated: '1 hour ago',
    createdAt: 'Yesterday, 22:40 EST',
    assistanceMode: 'focused',
    fileName: 'brain_dwi_adc_vol02.nii.gz',
    fileSize: '38.4 MB',
    voxelDims: '256x256x120 voxels',
    qualityResult: getQualityResultForCase('Case #1036'),
    clinicianDecision: {
      action: 'accept',
      clinicianName: 'Demo Clinician',
      clinicianRole: 'Clinician Review',
      timestamp: 'Yesterday, 22:52 EST',
      note: 'Concur with restricted diffusion profile in MCA distribution.',
      signatureHash: '0x8F9B22419AC4B72',
    },
  },
  {
    id: 'Case #1031',
    mrn: 'MRN: 3109-02A',
    scanType: 'CT Chest Angiogram',
    anatomy: 'Chest / Cardiology',
    clinicalTask: 'Pulmonary embolism rule-out',
    acquisitionProtocol: '128-slice CT · Siemens Somatom',
    dataSource: 'Enterprise VNA',
    qualityStatus: 'ready',
    qualityScore: 88,
    aiStatus: 'analyzed',
    confidence: 89,
    clinicianStatus: 'corrected',
    lastUpdated: '3 hours ago',
    createdAt: 'Yesterday, 19:12 EST',
    assistanceMode: 'explain',
    fileName: 'ct_chest_angio_contrast.nii.gz',
    fileSize: '62.0 MB',
    voxelDims: '512x512x240 voxels',
    qualityResult: getQualityResultForCase('Case #1031'),
    clinicianDecision: {
      action: 'correct',
      clinicianName: 'Dr. Sarah Jenkins, MD',
      clinicianRole: 'Staff Radiologist',
      timestamp: 'Yesterday, 19:28 EST',
      note: 'Expanded penumbra region by +1.1 cm³ after adjusting T2-FLAIR window settings.',
      signatureHash: '0x3AC119DE899014B',
    },
  },
  {
    id: 'Case #1028',
    mrn: 'MRN: 7741-99K',
    scanType: 'MRI Spine (Sagittal T2)',
    anatomy: 'Spine / Orthopedics',
    clinicalTask: 'Cervical radiculopathy & cord compression check',
    acquisitionProtocol: '3.0T MRI · Siemens Skyra',
    dataSource: 'External DICOM Direct Upload',
    qualityStatus: 'review_required',
    qualityScore: 38,
    aiStatus: 'inference_withheld',
    confidence: null,
    clinicianStatus: 'overridden',
    lastUpdated: '4 hours ago',
    createdAt: 'Oct 24, 16:04 EST',
    assistanceMode: 'review',
    fileName: 'mri_spine_cervical_sag.nii.gz',
    fileSize: '29.5 MB',
    voxelDims: '256x256x48 voxels',
    qualityResult: getQualityResultForCase('Case #1028'),
    clinicianDecision: {
      action: 'accept',
      clinicianName: 'Dr. Marcus Vance, MD',
      clinicianRole: 'Chief of Radiology',
      timestamp: 'Oct 24, 16:15 EST',
      note: 'Clinician manual read performed. Overriding automated gate due to acute clinical urgency.',
      signatureHash: '0x5D8E4211A9908F2',
    },
  },
];

export const INITIAL_LOG_EVENTS: DecisionLogEvent[] = [
  {
    id: 'EVT-1042-01',
    caseId: 'Case #1042',
    timestamp: 'Today, 08:42:10 UTC',
    type: 'upload',
    title: 'Scan Uploaded',
    description: 'NIfTI volume brain_t1_t2_flair_deidentified.nii.gz ingested from PACS Suite 4 (Source IP: 192.168.10.42 • Modality: MRI 3.0T).',
    badge: 'INGESTED',
    badgeType: 'neutral',
  },
  {
    id: 'EVT-1042-02',
    caseId: 'Case #1042',
    timestamp: 'Today, 08:42:18 UTC',
    type: 'quality_check',
    title: 'Quality Assessment Completed',
    description: 'Passed 6/6 deterministic safety checks (Demo quality score: 86/100 — not a clinical measurement). Motion artifact index 0.08 (nominal, tolerance < 0.20). SNR: 24.2 dB, Slice: 0.8 mm.',
    badge: 'GATE: PASS',
    badgeType: 'primary',
  },
  {
    id: 'EVT-1042-03',
    caseId: 'Case #1042',
    timestamp: 'Today, 08:43:02 UTC',
    type: 'mode_selected',
    title: 'Assistance Mode Selected',
    description: 'Clinician initialized interactive session under Explain Mode with feature attribution maps loaded.',
    badge: 'EXPLAIN MODE',
    badgeType: 'secondary',
  },
  {
    id: 'EVT-1042-04',
    caseId: 'Case #1042',
    timestamp: 'Today, 08:43:45 UTC',
    type: 'ai_inference',
    title: 'NVIDIA BraTS Segmentation Loaded (Demo Result)',
    description: 'NVIDIA BraTS automated MRI segmentation identified tumor-associated regions: Whole Tumor: 94.97 mL, Tumor Core: 52.18 mL, Enhancing Tumor: 28.47 mL. Modality: FLAIR Slice 87 (2,007 tumor voxels). Evaluated on BraTS2021_00495.',
    badge: 'NVIDIA BraTS DEMO',
    badgeType: 'secondary',
    details: {
      whole_tumor_volume_ml: 94.97,
      tumor_core_volume_ml: 52.18,
      enhancing_tumor_volume_ml: 28.47,
      representative_slice: 87,
      whole_tumor_dice: 0.9513,
      evaluation_case: 'BraTS2021_00495',
    },
  },
  {
    id: 'EVT-1042-05',
    caseId: 'Case #1042',
    timestamp: 'Today, 08:45:12 UTC',
    type: 'explanation_viewed',
    title: 'Explanation Explored',
    description: 'Clinician queried why finding was flagged and inspected voxel intensity delta. Inspected FLAIR hyperintensity hypervolume comparison with normative baseline database (N=1,420).',
    badge: 'EXPLAINABILITY',
    badgeType: 'neutral',
  },
  {
    id: 'EVT-1042-06',
    caseId: 'Case #1042',
    timestamp: 'Today, 08:47:30 UTC',
    type: 'clinician_review',
    title: 'Clinician Action Taken: Review Completed',
    description: 'Clinician review recorded under prototype workflow.',
    badge: 'REVIEWED',
    badgeType: 'secondary',
    clinicianName: 'Demo Clinician',
  },
  {
    id: 'EVT-1042-07',
    caseId: 'Case #1042',
    timestamp: 'Today, 08:48:00 UTC',
    type: 'ratified',
    title: 'Clinician Review Recorded',
    description: 'Clinician review recorded by Demo Clinician. Demo audit record.',
    badge: 'REVIEW RECORDED',
    badgeType: 'primary',
    hash: 'REC-1042-881c',
  },
  {
    id: 'EVT-1039-01',
    caseId: 'Case #1039',
    timestamp: 'Today, 07:15 UTC',
    type: 'intercept',
    title: 'Quality Gate Intercept Triggered',
    description: 'Quality Gate intercept triggered (Demo quality score: 42/100 — not a clinical measurement). Failed gating threshold. FLAIR sequence missing, SNR 11.2 dB, motion ghosting 18.4%. AI inference strictly withheld.',
    badge: 'INTERCEPTED',
    badgeType: 'error',
  },
  {
    id: 'EVT-1039-02',
    caseId: 'Case #1039',
    timestamp: 'Today, 07:18 UTC',
    type: 'escalation',
    title: 'Human Review Requested',
    description: 'Study escalated for clinician review. Patient re-scan protocol flagged.',
    badge: 'HUMAN MANDATED',
    badgeType: 'error',
    clinicianName: 'Demo Clinician',
  },
];

export function getStoredCases(): Case[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CASES);
    if (!raw) {
      saveStoredCases(INITIAL_CASES);
      return INITIAL_CASES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CASES;
  }
}

export function saveStoredCases(cases: Case[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save cases to localStorage', err);
  }
}

export function getStoredDecisionLogs(): DecisionLogEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      saveStoredDecisionLogs(INITIAL_LOG_EVENTS);
      return INITIAL_LOG_EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LOG_EVENTS;
  }
}

export function saveStoredDecisionLogs(logs: DecisionLogEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save logs to localStorage', err);
  }
}

export function addDecisionLogEvent(event: Omit<DecisionLogEvent, 'id'>): DecisionLogEvent {
  const logs = getStoredDecisionLogs();
  const newEvent: DecisionLogEvent = {
    ...event,
    id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  };
  const updated = [newEvent, ...logs];
  saveStoredDecisionLogs(updated);
  return newEvent;
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      saveStoredSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function exportAuditPackNDJSON(): string {
  const cases = getStoredCases();
  const logs = getStoredDecisionLogs();
  const pack = {
    exportDate: new Date().toISOString(),
    system: 'Adaptive Scan AI',
    standard: 'Decision Log — Demo Audit Record',
    auditor: 'Demo Clinician',
    cases,
    auditTrail: logs,
  };
  return JSON.stringify(pack, null, 2);
}
