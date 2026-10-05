import React, { useState } from 'react';
import { ASSETS } from '../constants/assets';
import { Case } from '../types';
import { getQualityResultForCase } from '../services/qualityService';
import { addDecisionLogEvent } from '../services/storageService';
import { NavView } from './Sidebar';

interface QualityGateViewProps {
  currentCase: Case;
  onNavigate: (view: NavView) => void;
  onUpdateCase: (updated: Case) => void;
}

export const QualityGateView: React.FC<QualityGateViewProps> = ({
  currentCase,
  onNavigate,
  onUpdateCase,
}) => {
  const quality = currentCase.qualityResult || getQualityResultForCase(currentCase.id);
  const isPassed = quality.inferenceAllowed;

  const [activeOrthoview, setActiveOrthoview] = useState<'axial' | 'coronal' | 'sagittal'>('axial');
  const [showRawLogs, setShowRawLogs] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [escalationToast, setEscalationToast] = useState(false);
  const [rescanDispatched, setRescanDispatched] = useState(false);
  const [auditDownloadToast, setAuditDownloadToast] = useState(false);

  const handleRecalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
    }, 1200);
  };

  const handleDownloadAudit = () => {
    setAuditDownloadToast(true);
    setTimeout(() => {
      setAuditDownloadToast(false);
    }, 3000);
  };

  const handleRequestHumanReview = () => {
    // Escalate to human review
    const updated: Case = {
      ...currentCase,
      clinicianStatus: 'escalated',
      lastUpdated: 'Just now',
    };
    onUpdateCase(updated);

    addDecisionLogEvent({
      caseId: currentCase.id,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      type: 'escalation',
      title: 'Human Clinical Oversight Requested',
      description: `Study ${currentCase.id} manually escalated for clinician review due to Quality Gate blockage (Demo quality score: ${quality.qualityScore}/100 — not a clinical measurement).`,
      badge: 'ESCALATED',
      badgeType: 'error',
      clinicianName: 'Demo Clinician',
    });

    setEscalationToast(true);
    setTimeout(() => {
      setEscalationToast(false);
    }, 4000);
  };

  const handleOrderRescan = () => {
    setRescanDispatched(true);
    addDecisionLogEvent({
      caseId: currentCase.id,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      type: 'intercept',
      title: 'Patient Re-scan Protocol Dispatched',
      description: `Repeat acquisition order generated for ${currentCase.id} targeting T2 & FLAIR sequences to eliminate patient translation artifacts.`,
      badge: 'RE-SCAN ORDERED',
      badgeType: 'neutral',
    });
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Breadcrumb & Workflow Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md py-space-lg">
        <div className="flex flex-col gap-space-xs">
          <nav className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
            <span
              className="hover:text-primary transition-colors cursor-pointer"
              onClick={() => onNavigate('dashboard')}
            >
              Cases
            </span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-data-mono-sm text-data-mono-sm font-semibold text-on-surface">
              {currentCase.id}
            </span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className={`font-medium ${isPassed ? 'text-primary' : 'text-error'}`}>
              Scan Quality Assessment
            </span>
          </nav>

          <div className="flex items-baseline gap-space-md mt-1">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Scan Quality Assessment
            </h1>
            {isPassed ? (
              <span className="font-data-mono-sm text-data-mono-sm px-space-sm py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-semibold tracking-wider uppercase">
                GATE_STAGE_01 // PASS
              </span>
            ) : (
              <span className="font-data-mono-sm text-data-mono-sm px-space-sm py-0.5 rounded bg-error-container text-on-error-container font-semibold tracking-wider uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">lock</span>
                <span>INFERENCE BLOCKED</span>
              </span>
            )}
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            The system checks whether the available scan provides sufficient evidence for reliable
            AI-assisted analysis.
          </p>
        </div>

        {/* Metatags */}
        <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
          <div className="flex items-center gap-2 px-space-md py-space-xs rounded bg-surface-container-low shadow-sm border border-outline-variant/30">
            <span
              className={`w-2 h-2 rounded-full ${isPassed ? 'bg-primary' : 'bg-error'} animate-pulse`}
            ></span>
            <span className="font-data-mono-sm text-data-mono-sm text-on-surface">
              DICOM Verification Engine v4.8
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-space-md py-space-xs rounded bg-surface-container-high text-on-surface">
            <span className="material-symbols-outlined text-sm text-primary">schedule</span>
            <span className="font-data-mono-sm text-data-mono-sm">Latency: 412ms</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STATE 1: PASS SCENARIO (e.g. Case #1042)
          ========================================================================= */}
      {isPassed ? (
        <>
          {/* Primary Score Banner & Visual Hero Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-lg">
            {/* Hero Score Gauge & Reassurance Banner (8 Cols) */}
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/20">
              <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary-fixed/25 blur-3xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md pb-space-lg relative z-10">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                    Quality Gate Status: Ready (6/6 Checks Passed)
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-semibold">
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>AI INFERENCE ALLOWED</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                  <span>THRESHOLD:</span>
                  <span className="font-semibold text-on-surface px-1.5 py-0.5 rounded bg-surface-container">
                    {quality.toleranceThreshold} / 100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center py-space-md relative z-10">
                {/* SVG Gauge Metric */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-space-md rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                      <circle
                        className="text-surface-container-highest"
                        cx="60"
                        cy="60"
                        fill="transparent"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="10"
                      ></circle>
                      <circle
                        className="text-primary-container transition-all duration-1000 ease-out"
                        cx="60"
                        cy="60"
                        fill="transparent"
                        r="50"
                        stroke="currentColor"
                        strokeDasharray="314.16"
                        strokeDashoffset="43.98"
                        strokeLinecap="round"
                        strokeWidth="10"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                      <span className="font-data-mono-md text-display-lg leading-none font-bold text-on-surface tracking-tighter">
                        {quality.qualityScore}
                      </span>
                      <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant font-semibold tracking-wider mt-0.5">
                        / 100
                      </span>
                      <span className="text-[10px] text-on-surface-variant mt-1 leading-tight font-medium">
                        Demo quality score — not a clinical measurement
                      </span>
                    </div>
                  </div>
                  <div className="mt-space-sm flex items-center gap-space-xs text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                    <span className="material-symbols-outlined text-xs text-primary">speed</span>
                    <span>Sampling: {quality.samplingVoxels.toLocaleString()} Voxels</span>
                  </div>
                </div>

                {/* Three Primary Safety Assertions */}
                <div className="md:col-span-7 flex flex-col gap-space-sm">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
                    Core Safety Reassurance Check
                  </span>
                  <div className="flex items-start gap-space-md p-space-md rounded bg-surface-container hover:bg-surface-container-high transition-colors">
                    <div className="p-1 rounded-full bg-primary text-on-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-sm block">check</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                        Sufficient image quality
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        High-contrast anatomical tissue delineation across all spatial axes.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-md p-space-md rounded bg-surface-container hover:bg-surface-container-high transition-colors">
                    <div className="p-1 rounded-full bg-primary text-on-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-sm block">check</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                        Required data available
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        All prescribed MRI multi-sequence volumes intact and registered.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-md p-space-md rounded bg-surface-container hover:bg-surface-container-high transition-colors">
                    <div className="p-1 rounded-full bg-primary text-on-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-sm block">check</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                        No critical quality issues detected
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Zero susceptibility or motion ring distortions exceeding tolerance limits.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Identification Strip */}
              <div className="mt-space-md pt-space-md flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded">
                <div className="flex items-center gap-space-sm font-data-mono-sm text-data-mono-sm text-on-surface">
                  <span className="material-symbols-outlined text-base text-secondary">database</span>
                  <span>STUDY_UID: {quality.technicalMetadata.studyUid}</span>
                </div>
                <div className="flex items-center gap-space-md font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                  <span>SERIES: {quality.technicalMetadata.seriesId}</span>
                  <span>ACQUIRED: TODAY 08:42 EST</span>
                </div>
              </div>
            </div>

            {/* Volumetric Scan Visualizer & Slice Preview (4 Cols) */}
            <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/20">
              <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">view_in_ar</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Sequence Orthoview
                  </span>
                </div>
                <span className="font-data-mono-sm text-data-mono-sm px-1.5 py-0.5 bg-surface-container-high text-on-surface rounded">
                  AXIAL SLICE 88/176
                </span>
              </div>

              {/* Scan Frame Container */}
              <div className="relative w-full h-56 rounded bg-inverse-surface overflow-hidden group shadow-inner flex items-center justify-center">
                <img
                  alt="High contrast medical cranial MRI"
                  className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                  src={
                    activeOrthoview === 'sagittal'
                      ? ASSETS.scanSagittal
                      : activeOrthoview === 'coronal'
                      ? ASSETS.scanCoronal
                      : ASSETS.scanHighRes1042
                  }
                />
                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 font-data-mono-sm text-[10px] text-primary-fixed">
                  <div className="flex justify-between items-center">
                    <span>R_LATERAL</span>
                    <span className="px-1 bg-inverse-surface/80 rounded">FOV: 240mm</span>
                    <span>L_LATERAL</span>
                  </div>
                  <div className="flex justify-center items-center opacity-70">
                    <svg
                      className="w-16 h-16 text-primary-fixed/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 100 100"
                    >
                      <circle cx="50" cy="50" r="30" strokeDasharray="2 2" strokeWidth="1"></circle>
                      <line strokeWidth="0.75" x1="50" x2="50" y1="0" y2="100"></line>
                      <line strokeWidth="0.75" x1="0" x2="100" y1="50" y2="50"></line>
                    </svg>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>TE: 85ms</span>
                    <span className="px-1.5 py-0.5 bg-primary/90 text-on-primary rounded font-bold">
                      QA PASS
                    </span>
                    <span>TR: 2200ms</span>
                  </div>
                </div>
              </div>

              {/* Orthogonal Slices Selector Tabs */}
              <div className="grid grid-cols-3 gap-space-xs mt-space-sm">
                <button
                  type="button"
                  onClick={() => setActiveOrthoview('axial')}
                  className={`px-2 py-1.5 rounded text-center font-data-mono-sm text-data-mono-sm font-medium transition-colors cursor-pointer ${
                    activeOrthoview === 'axial'
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  Axial
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOrthoview('coronal')}
                  className={`px-2 py-1.5 rounded text-center font-data-mono-sm text-data-mono-sm font-medium transition-colors cursor-pointer ${
                    activeOrthoview === 'coronal'
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  Coronal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOrthoview('sagittal')}
                  className={`px-2 py-1.5 rounded text-center font-data-mono-sm text-data-mono-sm font-medium transition-colors cursor-pointer ${
                    activeOrthoview === 'sagittal'
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  Sagittal
                </button>
              </div>

              <div className="mt-space-sm pt-space-xs flex justify-between items-center font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                <span>Geometric Distortion:</span>
                <span className="text-on-surface font-semibold">&lt; 0.28% (Nominal)</span>
              </div>
            </div>
          </div>

          {/* Quality Assessment Matrix & Scan Metadata Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-lg">
            {/* 6-Check Checklist Matrix (8 Cols) */}
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col border border-outline-variant/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-space-md gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="p-1 rounded bg-surface-container text-primary">
                    <span className="material-symbols-outlined text-lg">checklist_rtl</span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      Quality Assessment Matrix
                    </h2>
                    <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                      6 of 6 Automated Pre-flight Gate Criteria Verified
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container font-data-mono-sm text-data-mono-sm text-on-surface">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>Normative Baseline: ISO/IEC 17025 DICOM</span>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="flex flex-col gap-space-xs mt-space-xs">
                {quality.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md rounded bg-surface-container-low hover:bg-surface-container transition-colors gap-space-sm"
                  >
                    <div className="flex items-center gap-space-md min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined text-base">check</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-body-md text-body-md font-semibold text-on-surface">
                            {chk.name}
                          </span>
                          <span className="font-data-mono-sm text-[10px] text-on-surface-variant">
                            {chk.code}
                          </span>
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                          {chk.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-md shrink-0 self-end sm:self-center">
                      <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant hidden md:inline">
                        {chk.detail}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
                        <span className="material-symbols-outlined text-xs">check</span>
                        <span>{chk.badgeText}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Scan Metadata (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-space-lg">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col border border-outline-variant/20">
                <div className="flex items-center justify-between pb-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-lg">tune</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Technical Scan Metadata
                    </h3>
                  </div>
                  <span className="font-data-mono-sm text-data-mono-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface">
                    DICOM 3.0
                  </span>
                </div>

                <div className="flex flex-col gap-space-xs mt-space-sm">
                  <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Matrix Dimensions
                    </span>
                    <span className="font-data-mono-md text-data-mono-md font-semibold text-on-surface">
                      {quality.technicalMetadata.matrixDimensions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Magnetic Field Strength
                    </span>
                    <span className="font-data-mono-md text-data-mono-md font-semibold text-on-surface">
                      {quality.technicalMetadata.magneticFieldStrength}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Slice Thickness
                    </span>
                    <span className="font-data-mono-md text-data-mono-md font-semibold text-on-surface">
                      {quality.technicalMetadata.sliceThickness}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Pixel Bandwidth
                    </span>
                    <span className="font-data-mono-md text-data-mono-md font-semibold text-on-surface">
                      {quality.technicalMetadata.pixelBandwidth}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Flip Angle (α)
                    </span>
                    <span className="font-data-mono-md text-data-mono-md font-semibold text-on-surface">
                      {quality.technicalMetadata.flipAngle}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-low">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Scanner Manufacturer
                    </span>
                    <span className="font-data-mono-md text-data-mono-md font-semibold text-on-surface truncate max-w-[140px]">
                      {quality.technicalMetadata.scannerManufacturer}
                    </span>
                  </div>
                </div>

                <div className="mt-space-md p-space-sm rounded bg-surface-container flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">verified</span>
                    <span className="font-label-sm text-label-sm text-on-surface">
                      Coil Calibration Verified
                    </span>
                  </div>
                  <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                    {quality.technicalMetadata.calibrationCode}
                  </span>
                </div>
              </div>

              {/* Human Oversight Notice */}
              <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/20">
                <div className="flex items-center gap-space-sm mb-space-xs">
                  <span className="material-symbols-outlined text-primary text-lg">
                    admin_panel_settings
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Human-in-the-Loop Protocol
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Passing this automated gate permits AI inference generation. However, all
                  diagnostic impressions remain provisional until ratified by the attending
                  radiologist.
                </p>
                <div className="mt-space-sm flex items-center gap-2 text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                  <span className="material-symbols-outlined text-sm">lock_clock</span>
                  <span>Lock Token #{currentCase.id.replace('Case #', '')}-S3-VALID</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Decision Rationale Callout Card */}
          <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-lg relative overflow-hidden border border-outline-variant/20">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-space-lg">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-2xl">shield_with_heart</span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-space-sm flex-wrap mb-1">
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    System Decision Rationale
                  </span>
                  <span className="font-data-mono-sm text-data-mono-sm px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-semibold uppercase">
                    Inference Approved
                  </span>
                  <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                    Model: NeuroVoxel-DenseNet-v3
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {quality.rationale}
                </p>
              </div>
              <div className="flex items-center gap-space-xs self-stretch md:self-auto justify-end shrink-0 pt-space-xs md:pt-0">
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant px-2.5 py-1 rounded bg-surface-container">
                  Confidence Dispersion: ±0.03
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Global Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/20">
            <button
              onClick={handleDownloadAudit}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-space-lg py-space-sm rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md font-semibold cursor-pointer shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              <span>Download Quality Audit Report (.pdf)</span>
            </button>

            <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
              <button
                onClick={handleRecalibrate}
                disabled={isCalibrating}
                className="flex items-center justify-center gap-1.5 px-space-md py-space-sm rounded bg-surface-container-low text-on-surface hover:bg-surface-container hover:text-primary transition-colors font-label-md text-label-md font-medium cursor-pointer"
                type="button"
              >
                <span
                  className={`material-symbols-outlined text-base ${
                    isCalibrating ? 'animate-spin' : ''
                  }`}
                >
                  restart_alt
                </span>
                <span>{isCalibrating ? 'Calibrating...' : 'Re-run Calibration'}</span>
              </button>
              <button
                onClick={() => onNavigate('assistance-settings')}
                className="flex items-center justify-center gap-2 px-space-xl py-space-sm rounded bg-primary-container text-on-primary hover:bg-primary transition-colors font-label-md text-label-md font-semibold shadow-sm cursor-pointer"
                type="button"
              >
                <span>Continue to Assistance Settings</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* =========================================================================
           STATE 2: QUALITY GATE BLOCKED / FAILED SCENARIO (e.g. Case #1039)
           CRITICAL SAFETY RULE: AI INFERENCE WITHHELD.
           ========================================================================= */
        <div className="flex flex-col gap-space-lg">
          {/* Quality Score Hero Banner: High-contrast safety halt */}
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-md border border-error/30">
            <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-error"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg p-space-xl pl-8 items-center">
              {/* Score dial & Status */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-space-md items-start sm:items-center lg:items-start justify-between">
                <div className="flex items-center gap-space-lg">
                  <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-error-container/40">
                    <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100">
                      <circle
                        className="text-surface-container-high fill-transparent"
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="currentColor"
                        strokeWidth="8"
                      ></circle>
                      <circle
                        className="text-error fill-transparent"
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="currentColor"
                        strokeDasharray="263.89"
                        strokeDashoffset="153.0"
                        strokeLinecap="round"
                        strokeWidth="8"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                      <span className="font-display-lg text-display-lg text-error leading-none font-bold">
                        {quality.qualityScore}
                      </span>
                      <span className="font-data-mono-sm text-data-mono-sm text-error/80 uppercase">
                        / 100
                      </span>
                      <span className="text-[9px] text-error font-medium mt-0.5 leading-tight">
                        Demo quality score — not a clinical measurement
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                      Gating Threshold
                    </span>
                    <span className="font-data-mono-md text-data-mono-md text-on-surface">
                      Min Required: {quality.toleranceThreshold} / 100
                    </span>
                    <span className="font-label-sm text-label-sm text-error font-medium">
                      Deficit: -{quality.toleranceThreshold - quality.qualityScore} Pts
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded bg-error-container text-on-error-container">
                  <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                  <span className="font-data-mono-sm text-data-mono-sm font-semibold tracking-wider uppercase">
                    REVIEW REQUIRED · AI INFERENCE WITHHELD
                  </span>
                </div>
              </div>

              {/* Critical Safety Callout Body */}
              <div className="lg:col-span-8 flex flex-col gap-space-sm bg-surface-container-low p-space-lg rounded-lg border border-error/20">
                <div className="flex items-center gap-space-sm text-error">
                  <span className="material-symbols-outlined text-2xl">safety_check</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Analysis withheld — scan quality is insufficient for reliable model inference.
                    Human review is required.
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Human review is required before any AI-assisted interpretation can proceed. The
                  model refuses to generate automated findings on degraded or uncalibrated inputs to
                  prevent false reassurance or misleading false positives.
                </p>
                <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                  <div className="flex items-center gap-1.5 text-on-surface font-data-mono-sm text-data-mono-sm">
                    <span className="material-symbols-outlined text-base text-primary">verified</span>
                    <span>Adaptive Scan AI — Demo Guardrail</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface font-data-mono-sm text-data-mono-sm">
                    <span className="material-symbols-outlined text-base text-error">gavel</span>
                    <span>Zero-Hallucination Interlock Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                    <span className="material-symbols-outlined text-base text-on-surface-variant">
                      history
                    </span>
                    <span>Withheld at 14:32:08 UTC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Grid: Checklist Matrix (Left) & Visual Artifact Inspector (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            {/* Quality Checklist Matrix */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-xl">fact_check</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Deterministic Quality Gate Matrix
                    </h3>
                  </div>
                  <span className="font-data-mono-sm text-data-mono-sm text-error font-semibold">
                    3 PASSED · 3 NON-CONFORMANT
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Each scan series must satisfy all 6 deterministic structural checks prior to
                  triggering neural inference networks.
                </p>

                <div className="flex flex-col gap-space-sm mt-space-xs">
                  {quality.checks.map((chk) => (
                    <div
                      key={chk.id}
                      className={`flex items-start justify-between p-space-md rounded transition-colors ${
                        chk.status === 'failed'
                          ? 'bg-error-container/30 border border-error/30'
                          : 'bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-start gap-space-md">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            chk.status === 'failed'
                              ? 'bg-error text-on-error'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {chk.status === 'failed' ? 'close' : 'check'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-space-xs">
                            <span
                              className={`font-label-md text-label-md font-semibold ${
                                chk.status === 'failed' ? 'text-error' : 'text-on-surface'
                              }`}
                            >
                              {chk.name}
                            </span>
                            {chk.critical && (
                              <span className="font-data-mono-sm text-data-mono-sm text-error bg-error-container px-1 rounded">
                                CRITICAL
                              </span>
                            )}
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface mt-0.5">
                            {chk.description}
                          </span>
                          <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant mt-1">
                            {chk.detail}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-sm shrink-0">
                        <span
                          className={`font-data-mono-sm text-data-mono-sm font-semibold px-space-sm py-0.5 rounded ${
                            chk.status === 'failed'
                              ? 'text-error bg-error-container'
                              : 'text-primary bg-primary-fixed'
                          }`}
                        >
                          {chk.badgeText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainer Card: Why did AI stop? */}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
                <div className="flex items-center gap-space-xs text-primary">
                  <span className="material-symbols-outlined text-xl">psychology_alt</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Why did AI stop?
                  </h3>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Medical AI algorithms exhibit degraded sensitivity when phase ghosting exceeds
                  8%. Rather than risking an ambiguous false negative on potential micro-ischemic
                  lesions or generating hallucinatory boundaries, the model has entered deterministic
                  safe shutdown for this series. Re-acquisition or direct radiologist visual read is
                  required.
                </p>
                <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                  <span>Model Refusal Rule #R-709</span>
                  <span>Safety Harness: FDA CADe/CADx Class II Guidance</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Artifact Inspector */}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-error text-xl">blur_on</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Corrupted Slice Telemetry
                    </h3>
                  </div>
                  <span className="font-data-mono-sm text-data-mono-sm bg-surface-container-high px-space-sm py-0.5 rounded text-on-surface">
                    {quality.artifactDetails?.corruptedSlices || 'SLICES 44-58 / 64'}
                  </span>
                </div>

                <div className="relative bg-inverse-surface rounded-lg overflow-hidden flex flex-col items-center justify-center p-space-md aspect-[4/3] group">
                  <img
                    alt="Degraded brain MRI showing motion streak artifacts"
                    className="w-full h-full object-cover rounded filter contrast-125 brightness-90"
                    src={ASSETS.scanCorrupted1039}
                  />

                  {/* Artifact HUD Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-space-md">
                    <div className="flex items-center justify-between">
                      <span className="px-space-sm py-0.5 rounded bg-inverse-surface/90 text-inverse-on-surface font-data-mono-sm text-data-mono-sm">
                        SERIES 003 · AXIAL T2
                      </span>
                      <span className="px-space-sm py-0.5 rounded bg-error text-on-error font-data-mono-sm text-data-mono-sm font-semibold tracking-wide">
                        ARTIFACT REGION
                      </span>
                    </div>

                    <div className="relative w-full h-32 flex items-center justify-center">
                      <div className="absolute w-44 h-24 rounded-full border-2 border-dashed border-error/70 animate-pulse"></div>
                      <div className="absolute w-56 h-32 rounded-full border border-dashed border-error/40"></div>
                      <div className="bg-error/90 text-on-error px-space-sm py-0.5 rounded font-data-mono-sm text-data-mono-sm tracking-wider uppercase shadow-md">
                        Severe Motion Artifact Detected (Slices 44-58)
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-inverse-on-surface font-data-mono-sm text-data-mono-sm bg-inverse-surface/80 px-space-sm py-1 rounded backdrop-blur-sm">
                      <span>Phase Vector: Y-axis (A-P)</span>
                      <span>Ghosting Entropy: 0.812 [CRITICAL]</span>
                    </div>
                  </div>
                </div>

                {/* Slice Scrubber Indicator */}
                <div className="flex flex-col gap-1 mt-space-xs">
                  <div className="flex items-center justify-between font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                    <span>Slice Traverse (Axial)</span>
                    <span className="text-error font-semibold">Slice 51: Peak Phase Distortion</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container flex overflow-hidden">
                    <div className="w-[65%] bg-primary"></div>
                    <div className="w-[25%] bg-error"></div>
                    <div className="w-[10%] bg-surface-container-high"></div>
                  </div>
                  <div className="flex justify-between font-data-mono-sm text-data-mono-sm text-on-surface-variant text-[10px]">
                    <span>Slice 1 (Valid)</span>
                    <span className="text-error">Slices 44-58 (Discarded)</span>
                    <span>Slice 64 (Valid)</span>
                  </div>
                </div>
              </div>

              {/* Strict Clinical Safety Policy Notice */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-sm border border-outline-variant/20">
                <div className="flex items-center gap-space-xs text-on-surface">
                  <span className="material-symbols-outlined text-primary text-xl">
                    health_and_safety
                  </span>
                  <span className="font-headline-sm text-headline-sm">Clinical Assurance Protocol</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  By design,{' '}
                  <span className="font-semibold text-on-surface">
                    no automated diagnostic predictions, lesion volumetrics, or disease likelihood
                    percentages
                  </span>{' '}
                  are computed or accessible for this study. Bypassing requires explicit human
                  radiologist clinical takeover.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">
                    verified_user
                  </span>
                  <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                    Zero-Confidence Suppression Lock
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions & Clinical Overrides Bar */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md border border-outline-variant/20">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface-variant">
                <span className="material-symbols-outlined text-xl">person_alert</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Human Clinical Oversight Required
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Select an action pathway to advance patient workflow
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm">
              <button
                onClick={handleOrderRescan}
                disabled={rescanDispatched}
                className={`flex items-center gap-1.5 px-space-md py-2 rounded transition-colors font-label-md text-label-md font-semibold cursor-pointer ${
                  rescanDispatched
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-base">
                  {rescanDispatched ? 'check_circle' : 'restart_alt'}
                </span>
                <span>
                  {rescanDispatched ? 'Re-scan Order Dispatched' : 'Request Patient Re-scan Protocol'}
                </span>
              </button>

              <button
                onClick={() => setShowRawLogs(!showRawLogs)}
                className="flex items-center gap-1.5 px-space-md py-2 rounded bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors font-label-md text-label-md font-semibold cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-base">terminal</span>
                <span>{showRawLogs ? 'Hide Raw Logs' : 'View Detailed Diagnostic Metrics & Raw Logs'}</span>
              </button>

              <button
                onClick={handleRequestHumanReview}
                className="flex items-center gap-1.5 px-space-lg py-2 rounded bg-primary hover:bg-primary-container text-on-primary transition-colors font-label-md text-label-md font-semibold shadow-sm cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-base">assignment_ind</span>
                <span>Request Radiologist / Human Review</span>
              </button>
            </div>
          </div>

          {/* Collapsible Raw Logs Drawer */}
          {showRawLogs && (
            <div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-space-lg shadow-inner flex flex-col gap-space-sm border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs font-data-mono-md text-data-mono-md text-primary-fixed">
                  <span className="material-symbols-outlined text-base">data_object</span>
                  <span>TELEMETRY_LOG // STUDY-{currentCase.id.replace('#', '')} // SAFETY_GUARDRAIL_DUMP</span>
                </div>
                <button
                  className="text-inverse-on-surface hover:text-on-primary cursor-pointer p-1"
                  onClick={() => setShowRawLogs(false)}
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <pre className="font-data-mono-sm text-data-mono-sm bg-surface-container-lowest/5 p-space-md rounded overflow-x-auto text-primary-fixed-dim leading-relaxed">
{`[2024-10-24T14:32:01.002Z] INGEST: Series 003 DICOM stream uncompressed. Total slices: 64.
[2024-10-24T14:32:02.114Z] MATRIX: Dimensionality verified 256x256x64, isotropic: False, z-step: 3.0mm.
[2024-10-24T14:32:03.489Z] SEQUENCE_CHECK: Missing tag <FLAIR_AX>. Fallback: None. Result: [FAIL].
[2024-10-24T14:32:04.901Z] SNR_ESTIMATOR: Mean white matter signal: 342.1, Noise floor: 30.54, Calculated SNR: 11.20 dB (Ceiling: 18.00 dB). Result: [WARN_FAIL].
[2024-10-24T14:32:06.220Z] SPECTRAL_GHOSTING: Slice range [44..58] exhibits periodic phase shift artifact. Ghosting metric: 18.42% > 8.00%.
[2024-10-24T14:32:07.011Z] INTERLOCK_TRIGGERED: Rule #R-709 actuated. Inference withheld. Output payload zeroed.
[2024-10-24T14:32:08.000Z] STATUS: Demo quality score 42/100 (not a clinical measurement). Pushed to Radiologist Manual Verification Queue.`}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Toasts */}
      {escalationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded-lg shadow-xl flex items-center gap-space-md border border-primary-fixed/30 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-base">check</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-inverse-on-surface font-semibold">
              Study Escalated for Clinician Review
            </span>
            <span className="font-body-sm text-body-sm text-inverse-on-surface/80">
              Review assigned to Clinician on duty. AI inference lock held.
            </span>
          </div>
          <button
            className="ml-space-md text-inverse-on-surface hover:text-white cursor-pointer"
            onClick={() => setEscalationToast(false)}
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {auditDownloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded shadow-lg flex items-center gap-space-sm font-data-mono-sm text-data-mono-sm">
          <span className="material-symbols-outlined text-primary-fixed">downloading</span>
          <span>Generating QA Audit PDF Report QA-{currentCase.id.replace('#', '')}.pdf...</span>
        </div>
      )}
    </div>
  );
};
