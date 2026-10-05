import React, { useState } from 'react';
import { ASSETS } from '../constants/assets';
import { Case, ChatMessage, AssistanceMode } from '../types';
import { queryAIExplainer } from '../services/aiService';
import { REAL_NVIDIA_BRATS_RESULT, NvidiaBraTSResult } from '../services/nvidiaResultService';
import { addDecisionLogEvent } from '../services/storageService';
import { NavView } from './Sidebar';

interface AIFindingsViewProps {
  currentCase: Case;
  onNavigate: (view: NavView) => void;
  onUpdateCase: (updated: Case) => void;
}

export const AIFindingsView: React.FC<AIFindingsViewProps> = ({
  currentCase,
  onNavigate,
  onUpdateCase,
}) => {
  const nvidiaResult: NvidiaBraTSResult = currentCase.nvidiaResult || REAL_NVIDIA_BRATS_RESULT;
  const finding = currentCase.aiFinding;

  // Assistance mode toggle (allows switching between Focused, Explain, and Review within the workstation)
  const [activeMode, setActiveMode] = useState<AssistanceMode>(currentCase.assistanceMode || 'explain');

  // Viewport states - default to representative slice 87
  const [sliceIndex, setSliceIndex] = useState(nvidiaResult.visual_evidence.slice);
  const [activeWindow, setActiveWindow] = useState('FLAIR Tumor Window');
  const [zoomLevel, setZoomLevel] = useState(135);

  // Explainability drawer
  const [explainDrawerOpen, setExplainDrawerOpen] = useState(true);

  // Chat with AI about finding
  const [queryInput, setQueryInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'NVIDIA MONAI BraTS MRI segmentation result loaded for case evaluation. You can inquire about volumetric quantification, evaluation Dice metrics, slice distribution, or model boundaries.',
      timestamp: '08:44 UTC',
    },
  ]);

  // Clinician Determination state
  const [determination, setDetermination] = useState<'accept' | 'correct' | 'reject'>('accept');
  const [correctionNote, setCorrectionNote] = useState(
    'Concur with multi-region spatial extent; adjusted Whole Tumor boundary volume slightly based on original FLAIR review.'
  );
  const [correctedVolume, setCorrectedVolume] = useState(
    nvidiaResult.evidence.whole_tumor_volume_ml.toString()
  );
  const [rejectReason, setRejectReason] = useState('Insufficient Evidence / Sub-threshold');
  const [rejectNote, setRejectNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleAskQuestion = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || queryInput;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'clinician',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const aiAnswer = queryAIExplainer(query, finding);
    const aiMsg: ChatMessage = {
      id: `ai-${Date.now() + 1}`,
      sender: 'ai',
      text: aiAnswer,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg, aiMsg]);
    setQueryInput('');
  };

  const handleSaveDecision = () => {
    let noteToSave = '';
    let statusToSave: 'accepted' | 'corrected' | 'rejected' = 'accepted';

    if (determination === 'accept') {
      statusToSave = 'accepted';
      noteToSave = `Accepted: Concur with automated NVIDIA BraTS segmentation (Whole Tumor: ${nvidiaResult.evidence.whole_tumor_volume_ml} mL, Tumor Core: ${nvidiaResult.evidence.tumor_core_volume_ml} mL, Enhancing Tumor: ${nvidiaResult.evidence.enhancing_tumor_volume_ml} mL).`;
    } else if (determination === 'correct') {
      statusToSave = 'corrected';
      noteToSave = `Adjusted Whole Tumor volume from ${nvidiaResult.evidence.whole_tumor_volume_ml} mL to ${correctedVolume} mL; ${correctionNote}`;
    } else {
      statusToSave = 'rejected';
      noteToSave = `Rejected [${rejectReason}]: ${rejectNote || 'Segmentation marked unrepresentative or clinically non-consequential.'}`;
    }

    const updatedCase: Case = {
      ...currentCase,
      clinicianStatus: statusToSave,
      assistanceMode: activeMode,
      lastUpdated: 'Just now',
      clinicianDecision: {
        action: determination,
        clinicianName: 'Demo Clinician',
        clinicianRole: 'Clinician Review',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        note: noteToSave,
        rejectionReason: determination === 'reject' ? rejectReason : undefined,
        correctedMarginCm3: determination === 'correct' ? parseFloat(correctedVolume) : undefined,
        signatureHash: `0x${Math.random().toString(16).substring(2, 18).toUpperCase()}`,
      },
    };

    onUpdateCase(updatedCase);

    // Add immutable event to Decision Log
    addDecisionLogEvent({
      caseId: currentCase.id,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      type: 'clinician_review',
      title: `Clinician Determination: ${statusToSave.toUpperCase()}`,
      description: noteToSave,
      badge: statusToSave.toUpperCase(),
      badgeType: statusToSave === 'accepted' ? 'primary' : statusToSave === 'corrected' ? 'secondary' : 'error',
      clinicianName: 'Demo Clinician',
    });

    addDecisionLogEvent({
      caseId: currentCase.id,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      type: 'ratified',
      title: 'Clinician Review Recorded',
      description: `Case ${currentCase.id} review recorded under ${activeMode.toUpperCase()} mode by Demo Clinician. Demo audit record.`,
      badge: 'REVIEW RECORDED',
      badgeType: 'primary',
      hash: `REC-${Date.now()}`,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onNavigate('decision-log');
    }, 1200);
  };

  // If case quality was intercepted or AI analysis withheld
  if (currentCase.aiStatus === 'inference_withheld' || currentCase.qualityStatus === 'review_required') {
    return (
      <div className="py-space-xl flex flex-col items-center justify-center min-h-[500px] text-center gap-space-md">
        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">block</span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">
          AI Analysis Blocked — Human Review Required
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Analysis withheld — scan quality is insufficient for reliable model inference. Human review is required before any AI-assisted interpretation can proceed.
        </p>
        <div className="flex items-center gap-space-sm mt-space-md">
          <button
            onClick={() => onNavigate('quality-gate')}
            className="px-space-lg py-2 rounded bg-primary text-on-primary font-label-md text-label-md font-semibold cursor-pointer"
          >
            Review Quality Gate Intercept
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-16">
      {/* SECTION: NVIDIA BraTS Segmentation — Verified Demo Result BANNER */}
      <div className="w-full bg-surface-container-high border-b border-primary/30 px-space-xl py-space-sm rounded-t-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs mb-space-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-on-primary font-bold text-xs">
            NV
          </span>
          <span className="font-headline-sm text-sm sm:text-base font-bold text-on-surface tracking-tight">
            NVIDIA BraTS Segmentation — Verified Demo Result
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-data-mono-sm text-xs">
            Case: {nvidiaResult.model_evaluation.evaluation_case}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-data-mono-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
          <span>Loaded from research demo pipeline · Not computed locally in browser</span>
        </div>
      </div>

      {/* CASE HEADER BAR */}
      <header className="w-full bg-surface-container-lowest px-space-xl py-space-md shadow-sm mb-space-lg rounded flex flex-col xl:flex-row xl:items-center justify-between gap-space-md border border-outline-variant/20">
        <div className="flex flex-wrap items-center gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="w-2.5 h-7 rounded bg-primary inline-block"></span>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm">
                <h1 className="font-headline-sm text-headline-sm text-on-surface">
                  {currentCase.id} · {currentCase.scanType}
                </h1>
                <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                  STAT PRIORITY
                </span>
              </div>
              <span className="font-data-mono-md text-data-mono-md text-on-surface-variant">
                De-identified {currentCase.mrn} · {currentCase.acquisitionProtocol}
              </span>
            </div>
          </div>
        </div>

        {/* Adaptive Assistance Mode Selector & Badges */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Mode Switcher Pills */}
          <div className="flex items-center bg-surface-container-high p-0.5 rounded-lg border border-outline-variant/30">
            {(['focused', 'explain', 'review'] as AssistanceMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveMode(mode)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activeMode === mode
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-highest text-on-surface shadow-sm">
            <span className="material-symbols-outlined text-sm text-primary">verified</span>
            <span className="font-label-sm text-label-sm font-semibold text-primary">
              NVIDIA BraTS Model (Research)
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-space-md py-1 rounded bg-error-container text-on-error-container shadow-sm">
            <span className="material-symbols-outlined text-base">warning</span>
            <span className="font-label-md text-label-md font-semibold tracking-wide">
              DECISION-SUPPORT · ADVISORY ONLY
            </span>
          </div>
        </div>
      </header>

      {/* TOP NOTIFICATION: PROMINENT VALIDATION NOTE */}
      <div className="mb-space-lg p-space-md rounded bg-surface-container-low border-l-4 border-secondary flex flex-col md:flex-row md:items-center justify-between gap-space-sm shadow-xs">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-secondary text-xl shrink-0">info</span>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-bold text-on-surface">
              Dice scores are evaluation metrics and are not patient-specific confidence scores.
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              The NVIDIA model was trained for BraTS 2018 and evaluated here on a BraTS 2021 case ({nvidiaResult.model_evaluation.evaluation_case}). Segmentation alone does not establish a clinical diagnosis. Final interpretation must be performed by a qualified clinician.
            </span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-space-sm py-0.5 rounded bg-surface-container-high text-on-surface font-data-mono-sm text-xs font-semibold">
            Mode: {activeMode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* MAIN WORKBENCH SPLIT (Viewport + Structured Finding Inspector) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start pb-space-xl">
        {/* LEFT / CENTER COLUMN: IMAGING VIEWER & EVIDENCE (7 of 12 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-space-md">
          {/* Primary Scan Viewport Container */}
          <div className="relative w-full rounded bg-surface-container-lowest overflow-hidden shadow-md flex flex-col border border-outline-variant/20">
            {/* Viewport Toolbar */}
            <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container-high border-b border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <span className="font-data-mono-md text-data-mono-md font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                  Axial Slices ({nvidiaResult.visual_evidence.modality})
                </span>
                <span className={`font-data-mono-sm text-data-mono-sm px-space-xs py-0.5 rounded font-semibold ${
                  sliceIndex === nvidiaResult.visual_evidence.slice
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  Slice {sliceIndex} / 176 {sliceIndex === nvidiaResult.visual_evidence.slice && '★ Evidence Slice'}
                </span>
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                  Z: -14.2mm
                </span>
              </div>

              {/* Tool Controls Group */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-on-surface-variant font-data-mono-sm text-xs border border-outline-variant/30">
                  <span className="material-symbols-outlined text-xs text-primary">data_object</span>
                  <span>Modality: {nvidiaResult.visual_evidence.modality}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                  className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-base">zoom_in</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(100, z - 15))}
                  className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-base">zoom_out</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveWindow((w) =>
                      w === 'FLAIR Tumor Window' ? 'T1-Gd Contrast' : 'FLAIR Tumor Window'
                    )
                  }
                  className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer"
                  title="Window Preset"
                >
                  <span className="material-symbols-outlined text-base">brightness_medium</span>
                </button>
              </div>
            </div>

            {/* DICOM / MRI Canvas Simulation Container (Authentic Imaging — No Synthetic Images / Contours) */}
            <div className="relative w-full aspect-[4/3] bg-inverse-surface flex items-center justify-center select-none overflow-hidden group">
              <img
                alt="Axial Brain MRI Scan Slice"
                className="w-full h-full object-contain filter contrast-125 brightness-95 transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel / 100})` }}
                src={ASSETS.scanAxial1042}
              />

              {/* DICOM HUD Metadata Overlays */}
              <div className="absolute top-space-sm left-space-sm pointer-events-none flex flex-col gap-0.5 font-data-mono-sm text-data-mono-sm text-inverse-on-surface/90 bg-inverse-surface/85 p-space-xs rounded shadow-sm">
                <span>PAT: [ANONYMIZED-9942]</span>
                <span>CASE: {nvidiaResult.model_evaluation.evaluation_case}</span>
                <span>MODALITY: {nvidiaResult.visual_evidence.modality}</span>
                <span>SLICE: {sliceIndex} / 176</span>
              </div>
              <div className="absolute top-space-sm right-space-sm pointer-events-none text-right flex flex-col gap-0.5 font-data-mono-sm text-data-mono-sm text-inverse-on-surface/90 bg-inverse-surface/85 p-space-xs rounded shadow-sm">
                <span>SLICE VOXELS: {sliceIndex === nvidiaResult.visual_evidence.slice ? `${nvidiaResult.visual_evidence.tumor_voxels_on_slice.toLocaleString()}` : '~1,820'}</span>
                <span>WINDOW: {activeWindow}</span>
                <span>ZOOM: {zoomLevel}%</span>
              </div>

              {/* Visual Evidence Slice Tag & Evidence Placeholder on Slice 87 */}
              {sliceIndex === nvidiaResult.visual_evidence.slice && (
                <div className="absolute bottom-space-lg left-space-sm right-space-sm sm:right-auto pointer-events-none flex flex-col gap-1 bg-inverse-surface/95 px-space-sm py-2 rounded shadow-md border border-primary/40">
                  <div className="flex items-center gap-space-xs">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                    <span className="font-data-mono-sm text-data-mono-sm text-inverse-on-surface font-semibold">
                      Representative FLAIR Slice 87 · {nvidiaResult.visual_evidence.tumor_voxels_on_slice.toLocaleString()} Tumor Voxels
                    </span>
                  </div>
                  <span className="text-[11px] text-inverse-on-surface/80 font-sans italic">
                    Verified NVIDIA segmentation visualization available from the research inference pipeline.
                  </span>
                </div>
              )}

              {/* Prominent Safety Disclaimer Watermark */}
              <div className="absolute bottom-space-sm right-space-sm pointer-events-none px-space-md py-1 rounded bg-inverse-surface/90 text-on-primary-fixed shadow-md flex items-center gap-1.5 border border-white/10">
                <span className="material-symbols-outlined text-xs text-error">shield</span>
                <span className="font-label-sm text-label-sm tracking-wider uppercase font-medium">
                  Segmentation alone does not establish a clinical diagnosis
                </span>
              </div>
            </div>

            {/* Segmentation Regions Summary Bar */}
            <div className="px-space-md py-2 bg-surface-container-high border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-on-surface-variant font-sans font-semibold">Regions Evaluated:</span>
                {nvidiaResult.evidence.segmentation_regions.map((region) => (
                  <span
                    key={region}
                    className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface font-semibold border border-outline-variant/30"
                  >
                    {region}
                  </span>
                ))}
              </div>

              <div className="text-xs font-mono text-on-surface-variant">
                Evaluation Dice: WT 0.9513 · TC 0.9584 · ET 0.8722
              </div>
            </div>

            {/* Slice Scrubber Bar & Range Slider */}
            <div className="p-space-md bg-surface-container-lowest flex flex-col gap-space-xs">
              <div className="flex items-center justify-between text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-sm">layers</span>
                  <span>Axial Volumetric Scrubber</span>
                </div>
                <span>
                  Slice {sliceIndex} of 176 ({Math.round((sliceIndex / 176) * 100)}%)
                </span>
              </div>

              <div className="relative flex items-center w-full">
                <input
                  className="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
                  max="176"
                  min="1"
                  type="range"
                  value={sliceIndex}
                  onChange={(e) => setSliceIndex(parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSliceIndex((s) => Math.max(1, s - 1))}
                    className="px-space-xs py-0.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-data-mono-sm text-data-mono-sm cursor-pointer"
                  >
                    ◄ Prev Slice
                  </button>
                  <button
                    type="button"
                    onClick={() => setSliceIndex((s) => Math.min(176, s + 1))}
                    className="px-space-xs py-0.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-data-mono-sm text-data-mono-sm cursor-pointer"
                  >
                    Next Slice ►
                  </button>
                  <button
                    type="button"
                    onClick={() => setSliceIndex(nvidiaResult.visual_evidence.slice)}
                    className="px-space-xs py-0.5 rounded bg-primary-fixed hover:bg-primary-container text-on-primary-fixed font-data-mono-sm text-data-mono-sm ml-space-xs font-semibold cursor-pointer"
                  >
                    Center on Evidence Slice ({nvidiaResult.visual_evidence.slice})
                  </button>
                </div>
                <div className="flex items-center gap-space-sm font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                  <span>Modality: <strong>{nvidiaResult.visual_evidence.modality}</strong></span>
                  <span
                    className="text-primary font-semibold cursor-pointer hover:underline"
                    onClick={() => {
                      setZoomLevel(135);
                      setSliceIndex(nvidiaResult.visual_evidence.slice);
                    }}
                  >
                    Reset View
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: Segmentation Evidence */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">visibility</span>
                <h3 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                  Segmentation Evidence
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-data-mono-sm text-xs">
                Slice-Level Quantitative Evidence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-0.5">
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant font-medium">MODALITY</span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                  FLAIR
                </span>
                <span className="text-[11px] text-on-surface-variant">Multi-parametric MRI sequence</span>
              </div>

              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-0.5">
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant font-medium">SLICE</span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-primary">
                  Slice 87
                </span>
                <span className="text-[11px] text-on-surface-variant">Representative axial slice</span>
              </div>

              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-0.5">
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant font-medium">TUMOR VOXELS</span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-secondary">
                  2,007 tumor voxels
                </span>
                <span className="text-[11px] text-on-surface-variant">Evaluated on slice 87</span>
              </div>
            </div>

            {/* Clear Placeholder for segmentation visualization */}
            <div className="p-space-md rounded bg-surface-container-low border border-outline-variant/30 flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">image_not_supported</span>
              <p className="font-body-sm text-xs sm:text-sm text-on-surface font-medium leading-relaxed">
                Verified NVIDIA segmentation visualization available from the research inference pipeline.
              </p>
            </div>
          </div>

          {/* Volumetric Context Multi-planar Thumbnails */}
          <div className="grid grid-cols-3 gap-space-sm">
            <div className="relative bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col gap-1 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Sagittal Plane
                </span>
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                  Y: 104
                </span>
              </div>
              <div className="relative h-24 bg-inverse-surface rounded overflow-hidden flex items-center justify-center">
                <img
                  alt="Sagittal slice"
                  className="w-full h-full object-cover"
                  src={ASSETS.scanSagittal}
                />
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary/80"></div>
              </div>
            </div>

            <div className="relative bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col gap-1 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Coronal Plane
                </span>
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                  X: 128
                </span>
              </div>
              <div className="relative h-24 bg-inverse-surface rounded overflow-hidden flex items-center justify-center">
                <img
                  alt="Coronal plane"
                  className="w-full h-full object-cover"
                  src={ASSETS.scanCoronal}
                />
                <div className="absolute inset-y-0 left-[42%] w-0.5 bg-primary/80"></div>
              </div>
            </div>

            <div className="relative bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col gap-1 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  DWI / ADC Co-registration
                </span>
                <span className="font-data-mono-sm text-data-mono-sm text-secondary font-semibold">
                  b=1000
                </span>
              </div>
              <div className="relative h-24 bg-inverse-surface rounded overflow-hidden flex items-center justify-center">
                <img
                  alt="Diffusion weighted scan"
                  className="w-full h-full object-cover"
                  src={ASSETS.scanDwi}
                />
                <span className="absolute top-1 right-1 px-1 rounded bg-secondary text-on-secondary font-data-mono-sm text-data-mono-sm">
                  FLAIR MATCH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STRUCTURED AI FINDINGS & REVIEW PANEL (5 of 12 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-space-md">
          {/* SECTION: NVIDIA BraTS Segmentation — Verified Demo Result */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md border border-outline-variant/20">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded bg-primary text-on-primary font-data-mono-sm text-data-mono-sm font-bold tracking-wider uppercase">
                    NVIDIA BraTS Segmentation — Verified Demo Result
                  </span>
                </div>
                {/* EXACT VERIFIED FINDING */}
                <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface leading-snug pt-1">
                  Automated MRI segmentation identified distinct tumor-associated regions for clinician review.
                </h2>
              </div>
            </div>

            {/* 3 Quantitative Volume Metric Cards — Strict Labels: Whole Tumor, Tumor Core, Enhancing Tumor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              {/* Whole Tumor */}
              <div className="p-space-md rounded bg-[#00a896]/10 border border-[#00a896]/30 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-xs font-semibold text-[#005c55] uppercase tracking-wider">
                    Whole Tumor
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00a896]"></span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-headline-md text-2xl font-bold text-[#005c55]">
                    {nvidiaResult.evidence.whole_tumor_volume_ml}
                  </span>
                  <span className="font-data-mono-sm text-xs text-[#005c55]/80 font-medium">mL</span>
                </div>
              </div>

              {/* Tumor Core */}
              <div className="p-space-md rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-xs font-semibold text-[#b45309] uppercase tracking-wider">
                    Tumor Core
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-headline-md text-2xl font-bold text-[#b45309]">
                    {nvidiaResult.evidence.tumor_core_volume_ml}
                  </span>
                  <span className="font-data-mono-sm text-xs text-[#b45309]/80 font-medium">mL</span>
                </div>
              </div>

              {/* Enhancing Tumor */}
              <div className="p-space-md rounded bg-[#ef4444]/10 border border-[#ef4444]/30 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-xs font-semibold text-[#dc2626] uppercase tracking-wider">
                    Enhancing Tumor
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-headline-md text-2xl font-bold text-[#dc2626]">
                    {nvidiaResult.evidence.enhancing_tumor_volume_ml}
                  </span>
                  <span className="font-data-mono-sm text-xs text-[#dc2626]/80 font-medium">mL</span>
                </div>
              </div>
            </div>

            {/* Segmentation Regions Badges */}
            <div className="flex flex-wrap items-center gap-space-xs pt-1">
              <span className="text-xs text-on-surface-variant font-medium">Segmented Regions:</span>
              {nvidiaResult.evidence.segmentation_regions.map((region) => (
                <span
                  key={region}
                  className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-data-mono-sm text-xs font-semibold"
                >
                  ✓ {region}
                </span>
              ))}
            </div>

            {/* EXACT VERIFIED WHY IT MATTERS */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">lightbulb</span>
                <h3 className="font-label-md text-xs uppercase tracking-wider font-bold text-on-surface">
                  Why it matters
                </h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface bg-surface-container-low p-space-md rounded leading-relaxed border border-outline-variant/20">
                The segmentation provides quantitative estimates of the spatial extent of segmented regions and can assist a clinician during image review.
              </p>
            </div>
          </div>

          {/* SECTION: Evaluation Evidence */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">assessment</span>
                <h3 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface">
                  Evaluation Evidence
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-data-mono-sm text-[11px]">
                BraTS Benchmark Comparison
              </span>
            </div>

            {/* Three Dice Values Grid */}
            <div className="grid grid-cols-3 gap-space-sm">
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col items-center text-center">
                <span className="text-xs text-on-surface-variant font-medium">Whole Tumor Dice</span>
                <span className="text-lg font-bold font-mono text-[#005c55]">
                  0.9513
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">Evaluation metric</span>
              </div>

              <div className="p-space-sm rounded bg-surface-container-low flex flex-col items-center text-center">
                <span className="text-xs text-on-surface-variant font-medium">Tumor Core Dice</span>
                <span className="text-lg font-bold font-mono text-[#b45309]">
                  0.9584
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">Evaluation metric</span>
              </div>

              <div className="p-space-sm rounded bg-surface-container-low flex flex-col items-center text-center">
                <span className="text-xs text-on-surface-variant font-medium">Enhancing Tumor Dice</span>
                <span className="text-lg font-bold font-mono text-[#dc2626]">
                  0.8722
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">Evaluation metric</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs text-on-surface-variant bg-surface-container-low p-space-sm rounded font-mono">
              <div className="flex justify-between">
                <span>Evaluation case:</span>
                <span className="font-bold text-on-surface">BraTS2021_00495</span>
              </div>
              <div className="flex justify-between">
                <span>Evaluation type:</span>
                <span className="text-on-surface">Single-case comparison against provided ground truth.</span>
              </div>
            </div>

            {/* CLEAR NOTICE: DICE IS NOT PATIENT CONFIDENCE */}
            <div className="p-space-sm rounded bg-primary-fixed/30 border border-primary/30 flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-base mt-0.5">verified_user</span>
              <p className="text-xs text-on-surface leading-relaxed font-medium">
                Dice scores are evaluation metrics and are not patient-specific confidence scores.
              </p>
            </div>
          </div>

          {/* SECTION: Limitations & Recommended Action */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md border border-outline-variant/20">
            {/* Recommended Action */}
            <div className="p-space-md rounded bg-secondary-fixed/40 border-l-4 border-secondary flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-on-secondary-fixed">
                <span className="material-symbols-outlined text-base text-secondary">clinical_notes</span>
                <span className="font-label-md text-xs uppercase tracking-wider font-bold">
                  Recommended Action
                </span>
              </div>
              <p className="font-body-md text-sm font-semibold text-on-surface">
                Review the segmentation overlay against the original MRI before accepting the AI suggestion.
              </p>
            </div>

            {/* Numbered Limitations List */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-error">warning</span>
                <h4 className="font-label-md text-xs uppercase tracking-wider font-bold text-on-surface">
                  Limitations
                </h4>
              </div>
              <ul className="flex flex-col gap-1.5 text-xs text-on-surface-variant">
                {[
                  'This is an automated research/demo segmentation.',
                  'Dice scores are evaluation metrics and are not patient-specific confidence scores.',
                  'The NVIDIA model was trained for BraTS 2018 and evaluated here on a BraTS 2021 case.',
                  'Segmentation alone does not establish a clinical diagnosis.',
                  'Final interpretation must be performed by a qualified clinician.',
                ].map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-surface-container-low p-2 rounded">
                    <span className="font-mono font-bold text-primary shrink-0">{idx + 1}.</span>
                    <span className="leading-relaxed">{lim}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Explainability & Question Drawer */}
            <div className="flex flex-col rounded bg-surface-container-low overflow-hidden shadow-xs border border-outline-variant/20 mt-1">
              <button
                type="button"
                onClick={() => setExplainDrawerOpen(!explainDrawerOpen)}
                className="w-full flex items-center justify-between p-space-md bg-surface-container hover:bg-surface-container-high transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-base">psychology</span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Explainability & Clinician Question Thread
                  </span>
                </div>
                <span className="material-symbols-outlined text-base text-on-surface-variant">
                  {explainDrawerOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {explainDrawerOpen && (
                <div className="p-space-md flex flex-col gap-space-md">
                  {/* Pre-fill Quick Queries */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleAskQuestion(undefined, 'What are the quantitative tumor volumes?')}
                      className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface font-data-mono-sm text-[11px] cursor-pointer"
                    >
                      + Tumor Volumes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskQuestion(undefined, 'What are the evaluation Dice scores?')}
                      className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface font-data-mono-sm text-[11px] cursor-pointer"
                    >
                      + Dice Scores
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskQuestion(undefined, 'Show slice 87 visual evidence details')}
                      className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface font-data-mono-sm text-[11px] cursor-pointer"
                    >
                      + Slice 87 Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskQuestion(undefined, 'What are the model limitations?')}
                      className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface font-data-mono-sm text-[11px] cursor-pointer"
                    >
                      + Model Limitations
                    </button>
                  </div>

                  {/* Chat Messages */}
                  <div className="max-h-48 overflow-y-auto flex flex-col gap-2 p-space-xs bg-surface-container-lowest rounded border border-outline-variant/20">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-0.5 p-space-sm rounded max-w-[90%] shadow-sm ${
                          msg.sender === 'clinician'
                            ? 'bg-surface-container-highest self-end'
                            : 'bg-primary-fixed-dim/20 self-start'
                        }`}
                      >
                        <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">
                            {msg.sender === 'clinician' ? 'person' : 'auto_awesome'}
                          </span>
                          <span>{msg.sender === 'clinician' ? 'Demo Clinician' : 'NVIDIA BraTS Explainer'}</span>
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <form className="flex gap-space-xs items-center" onSubmit={handleAskQuestion}>
                    <input
                      className="flex-1 px-space-sm py-1.5 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none border border-outline-variant/40 focus:border-primary shadow-sm"
                      placeholder="Ask about segmentation volumes, Dice metrics, limitations..."
                      type="text"
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                    />
                    <button
                      className="px-space-md py-1.5 rounded bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-all shadow-sm shrink-0 cursor-pointer"
                      type="submit"
                    >
                      Inquire
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DOCTOR ACTION & RATIFICATION DOCK */}
      <footer className="sticky bottom-0 z-30 w-full bg-surface-container-lowest p-space-md shadow-2xl rounded-t-xl mb-space-lg flex flex-col gap-space-sm border border-outline-variant/30">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-space-md">
          {/* Clinician Action Selectors */}
          <div className="flex flex-wrap items-center gap-space-sm w-full lg:w-auto">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold mr-space-xs">
              Clinician Determination:
            </span>
            <button
              type="button"
              onClick={() => setDetermination('accept')}
              className={`flex items-center gap-1.5 px-space-md py-2 rounded font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer ${
                determination === 'accept'
                  ? 'ring-2 ring-primary bg-primary-fixed text-on-primary-fixed'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base text-primary">check_circle</span>
              <span>✓ Accept Segmentation</span>
            </button>

            <button
              type="button"
              onClick={() => setDetermination('correct')}
              className={`flex items-center gap-1.5 px-space-md py-2 rounded font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer ${
                determination === 'correct'
                  ? 'ring-2 ring-primary bg-secondary-fixed text-on-secondary-fixed'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base text-secondary">edit_note</span>
              <span>✎ Correct & Adjust</span>
            </button>

            <button
              type="button"
              onClick={() => setDetermination('reject')}
              className={`flex items-center gap-1.5 px-space-md py-2 rounded font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer ${
                determination === 'reject'
                  ? 'ring-2 ring-error bg-error-container text-on-error-container'
                  : 'bg-surface-container-low hover:bg-error-container text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base text-error">cancel</span>
              <span>✕ Reject Finding</span>
            </button>
          </div>

          {/* Ratify & Confirm */}
          <div className="flex items-center gap-space-md w-full lg:w-auto justify-end">
            <div className="flex flex-col text-right">
              <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                Reviewer: <strong>Demo Clinician</strong>
              </span>
              <span className="font-data-mono-sm text-data-mono-sm text-primary font-semibold">
                {determination === 'accept' && 'Accepted: Concur with automated regions'}
                {determination === 'correct' && `Adjusted: Volume calibrated to ${correctedVolume} mL`}
                {determination === 'reject' && `Rejected: ${rejectReason}`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSaveDecision}
              disabled={isSaved}
              className="flex items-center gap-space-sm px-space-xl py-2 rounded bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold shadow-md transition-all cursor-pointer disabled:opacity-75"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{isSaved ? 'Saving Review Record...' : 'Save Clinician Determination'}</span>
            </button>
          </div>
        </div>

        {/* Conditional Reject Reason Selector Drawer */}
        {determination === 'reject' && (
          <div className="p-space-md rounded bg-error-container/40 flex flex-col gap-space-xs mt-space-xs border border-error/30 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md font-semibold text-error">
                Select Clinical Rejection Rationale (Required for Decision Log):
              </span>
              <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                Logged
              </span>
            </div>
            <div className="flex flex-wrap gap-space-sm">
              {[
                'Insufficient Evidence / Sub-threshold',
                'Motion / RF Artifact Mimicker',
                'Clinical Context Differs (Chronic / Scar)',
                'Incorrect Boundary (Over-segmentation)',
                'Other Clinical Disagreement',
              ].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-sm cursor-pointer hover:bg-surface-container-low"
                >
                  <input
                    type="radio"
                    name="reject-reason"
                    checked={rejectReason === r}
                    onChange={() => setRejectReason(r)}
                    className="accent-error"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
            <div className="mt-1">
              <input
                className="w-full px-space-sm py-1 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none border border-outline-variant/30"
                placeholder="Optional clinician rejection details..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Conditional Clinician Adjust Input Drawer */}
        {determination === 'correct' && (
          <div className="p-space-md rounded bg-surface-container-low flex flex-col gap-space-xs mt-space-xs border border-outline-variant/30 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                Clinician Impression Calibration & Correction Note (Mandatory):
              </span>
              <span className="font-data-mono-sm text-data-mono-sm text-secondary font-medium">
                Overriding Model Segmentation
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-space-sm">
              <input
                className="flex-1 px-space-sm py-1.5 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm outline-none border border-outline-variant/30 shadow-sm"
                placeholder="Specify revised localization or sequence intensity note..."
                type="text"
                value={correctionNote}
                onChange={(e) => setCorrectionNote(e.target.value)}
              />
              <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/30">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Revised WT:</span>
                <input
                  type="number"
                  step="0.1"
                  className="w-16 font-data-mono-sm text-data-mono-sm text-on-surface font-bold outline-none"
                  value={correctedVolume}
                  onChange={(e) => setCorrectedVolume(e.target.value)}
                />
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">mL</span>
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};
