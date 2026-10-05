import React, { useState } from 'react';
import { AppSettings, AssistanceMode } from '../types';
import { saveStoredSettings } from '../services/storageService';
import { NavView } from './Sidebar';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onNavigate: (view: NavView) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onNavigate,
}) => {
  const [currentMode, setCurrentMode] = useState<AssistanceMode>(settings.defaultAssistanceMode);
  const [detailLevel, setDetailLevel] = useState<'standard' | 'granular' | 'raw'>(
    settings.explanationDetailLevel
  );
  const [audioAlert, setAudioAlert] = useState(settings.lowQualityAudioAlert);
  const [leadDigest, setLeadDigest] = useState(settings.technicalLeadDigest);
  const [leadEmail, setLeadEmail] = useState(settings.technicalLeadEmail);
  const [showToast, setShowToast] = useState(false);
  const [testPingSent, setTestPingSent] = useState(false);

  const handleSave = () => {
    const updated: AppSettings = {
      ...settings,
      defaultAssistanceMode: currentMode,
      explanationDetailLevel: detailLevel,
      lowQualityAudioAlert: audioAlert,
      technicalLeadDigest: leadDigest,
      technicalLeadEmail: leadEmail,
    };
    saveStoredSettings(updated);
    onUpdateSettings(updated);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  const handleTestPing = () => {
    setTestPingSent(true);
    setTimeout(() => setTestPingSent(false), 2500);
  };

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Top Context Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between py-space-xl gap-space-lg">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-data-mono-sm text-data-mono-sm tracking-wider uppercase">
            <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
            <span>Governance Architecture • Revision 4.2.1-SEC</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            Settings & Safety Controls
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Configure clinical workstation preferences, safety protocols, and governance guardrails.
            System-enforced invariants guarantee patient safety and regulatory compliance.
          </p>
        </div>

        {/* Compliance Tag */}
        <div className="flex items-center gap-space-md self-start md:self-auto bg-surface-container-lowest p-space-sm rounded-lg shadow-sm border border-outline-variant/30">
          <div className="flex flex-col text-right">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Station Standard
            </span>
            <span className="font-data-mono-md text-data-mono-md text-primary font-medium">
              FDA SaMD II • EU AI Act Class IIb
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
        {/* Left Column: Preferences (7 Cols) */}
        <div className="xl:col-span-7 flex flex-col gap-space-xl">
          {/* Section 1: AI Assistance Defaults */}
          <section className="bg-surface-container-lowest rounded-lg p-space-xl shadow-sm flex flex-col gap-space-lg border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="p-2 rounded bg-surface-container-high text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">tune</span>
                </span>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    AI Assistance Defaults
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Default heuristics applied during volumetric slice acquisition & DICOM rendering.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                CONFIG-01
              </span>
            </div>

            {/* Mode Radio Cards */}
            <div className="flex flex-col gap-space-sm">
              <label className="font-label-md text-label-md text-on-surface">
                Default Assistance Mode
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* Focused Mode */}
                <div
                  onClick={() => setCurrentMode('focused')}
                  className={`flex flex-col p-space-md rounded-lg transition-colors cursor-pointer border ${
                    currentMode === 'focused'
                      ? 'bg-primary-fixed/20 border-primary ring-1 ring-primary'
                      : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-headline-sm text-headline-sm text-on-surface">Focused</span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        currentMode === 'focused' ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      {currentMode === 'focused' && (
                        <span className="w-2 h-2 rounded-full bg-on-primary"></span>
                      )}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Minimal overlay. Displays only prioritized critical ROI bounding marks above 90%
                    confidence.
                  </p>
                  <div className="mt-space-md pt-space-xs flex items-center gap-1 font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs">speed</span> Low Latency
                  </div>
                </div>

                {/* Explain (Recommended) Mode */}
                <div
                  onClick={() => setCurrentMode('explain')}
                  className={`flex flex-col p-space-md rounded-lg transition-colors cursor-pointer border ${
                    currentMode === 'explain'
                      ? 'bg-primary-fixed/20 border-primary ring-1 ring-primary'
                      : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline-sm text-headline-sm text-primary">Explain</span>
                      <span className="px-1.5 py-0.2 rounded bg-primary text-on-primary font-label-sm text-label-sm uppercase font-semibold">
                        Recommended
                      </span>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        currentMode === 'explain' ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      {currentMode === 'explain' && (
                        <span className="w-2 h-2 rounded-full bg-on-primary"></span>
                      )}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Full spatial heatmaps, segmentation vectors, and comparative radiomic priors with
                    attribution cues.
                  </p>
                  <div className="mt-space-md pt-space-xs flex items-center gap-1 font-data-mono-sm text-data-mono-sm text-primary font-medium">
                    <span className="material-symbols-outlined text-xs">psychology</span> Full Diagnostic Chain
                  </div>
                </div>

                {/* Review Mode */}
                <div
                  onClick={() => setCurrentMode('review')}
                  className={`flex flex-col p-space-md rounded-lg transition-colors cursor-pointer border ${
                    currentMode === 'review'
                      ? 'bg-primary-fixed/20 border-primary ring-1 ring-primary'
                      : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-headline-sm text-headline-sm text-on-surface">Review</span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        currentMode === 'review' ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      {currentMode === 'review' && (
                        <span className="w-2 h-2 rounded-full bg-on-primary"></span>
                      )}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Stepped verification queue. Inferences remain hidden until primary clinician
                    logs baseline notes.
                  </p>
                  <div className="mt-space-md pt-space-xs flex items-center gap-1 font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs">playlist_add_check</span> Blinded Protocol
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation Detail Level Toggle */}
            <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border border-outline-variant/20">
              <div className="flex flex-col gap-0.5">
                <span className="font-label-md text-label-md text-on-surface">
                  Explanation Detail Level
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Surface SHAP feature importance vectors and Hounsfield distribution profiles.
                </span>
              </div>
              <div className="flex items-center bg-surface-container-lowest p-1 rounded shadow-xs self-start sm:self-auto border border-outline-variant/30">
                {(['standard', 'granular', 'raw'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDetailLevel(lvl)}
                    className={`px-space-md py-1 rounded font-label-sm text-label-sm transition-colors cursor-pointer capitalize ${
                      detailLevel === lvl
                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {lvl === 'granular' ? 'Granular (Radiomics)' : lvl}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: Privacy & Data Governance */}
          <section className="bg-surface-container-lowest rounded-lg p-space-xl shadow-sm flex flex-col gap-space-lg border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="p-2 rounded bg-surface-container-high text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">policy</span>
                </span>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Privacy & Data Governance
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Patient identifier scrubbing and zero-trust telemetry controls.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                HIPAA • GDPR
              </span>
            </div>

            <div className="flex flex-col gap-space-md">
              {/* DICOM Scrubber Card */}
              <div className="bg-surface-container-low rounded-lg p-space-md flex items-start justify-between gap-space-md border border-outline-variant/20">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-on-primary-fixed mt-0.5 shrink-0">
                    <span className="material-symbols-outlined text-base">enhanced_encryption</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Automatic DICOM Header Scrubber
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-data-mono-sm text-data-mono-sm font-semibold">
                        Active
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      PS 3.15 Annex E anonymization pipeline. Group{' '}
                      <code className="bg-surface-container-high px-1 py-0.5 rounded font-data-mono-sm text-data-mono-sm text-on-surface">
                        0x0010
                      </code>{' '}
                      tags (Patient Name, DOB, MRN) purged in-memory prior to AI inference dispatch.
                    </p>
                    <div className="flex items-center gap-space-md mt-space-sm font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                      <span>Hash Algorithm: SHA-256 HMAC</span>
                      <span>•</span>
                      <span>Salt Key: In-Enclave Vault</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <span className="material-symbols-outlined text-primary text-2xl" title="Mandatory active setting">
                    lock
                  </span>
                </div>
              </div>

              {/* Zero Data Retention Card */}
              <div className="bg-surface-container-low rounded-lg p-space-md flex items-start justify-between gap-space-md border border-outline-variant/20">
                <div className="flex items-start gap-space-md">
                  <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-on-primary-fixed mt-0.5 shrink-0">
                    <span className="material-symbols-outlined text-base">cloud_off</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Zero Data Retention for Training
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-data-mono-sm text-data-mono-sm font-semibold">
                        Enabled
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Institutional scans and user interaction deltas are never retained, indexed, or
                      pooled into foundation model weight tuning. Memory buffers flush immediately
                      post-session.
                    </p>
                    <div className="flex items-center gap-space-md mt-space-sm font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                      <span>Persistence: Volatile RAM Only</span>
                      <span>•</span>
                      <span>Retention: 0 ms post-render</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <span className="material-symbols-outlined text-primary text-2xl" title="Mandatory active setting">
                    lock
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Review-Required Notifications */}
          <section className="bg-surface-container-lowest rounded-lg p-space-xl shadow-sm flex flex-col gap-space-lg border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="p-2 rounded bg-surface-container-high text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">notifications_active</span>
                </span>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Review-Required Notifications
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Real-time telemetry cues when scans fail pre-flight validation gates.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                ALERT CHANNELS
              </span>
            </div>

            <div className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between p-space-md rounded-lg bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center gap-space-md">
                  <span className="material-symbols-outlined text-tertiary">volume_up</span>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface">
                      Low-Quality Scan Interceptions
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Trigger instant desktop badge & audible tone when DICOM artifacts exceed
                      tolerance.
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audioAlert}
                    onChange={(e) => setAudioAlert(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex flex-col p-space-md rounded-lg bg-surface-container-low gap-space-sm border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-tertiary">forward_to_inbox</span>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Quarantine Digest for Radiology Technical Lead
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Daily automated dispatch summarizing gated studies, SNR failures, and repeat
                        orders.
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={leadDigest}
                      onChange={(e) => setLeadDigest(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="mt-space-xs pt-space-xs pl-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
                  <label className="font-label-sm text-label-sm text-on-surface-variant shrink-0">
                    Designated Lead Email:
                  </label>
                  <input
                    className="bg-surface-container-lowest px-space-md py-1 rounded font-data-mono-sm text-data-mono-sm text-on-surface flex-1 focus:outline-none border border-outline-variant/30 focus:border-primary shadow-xs"
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleTestPing}
                    className="px-space-md py-1 rounded bg-surface-container-high text-on-surface hover:bg-surface-dim font-label-sm text-label-sm transition-colors cursor-pointer"
                  >
                    {testPingSent ? 'Ping Dispatched!' : 'Test Ping'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Save Action */}
          <div className="flex items-center justify-between pt-space-sm pb-space-lg">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-data-mono-sm text-data-mono-sm">
              <span className="material-symbols-outlined text-base text-primary">cloud_done</span>
              <span>Last synchronized with PACS registry: 4 mins ago</span>
            </div>
            <div className="flex items-center gap-space-md">
              <button
                type="button"
                onClick={() => {
                  setCurrentMode('explain');
                  setDetailLevel('granular');
                  setAudioAlert(true);
                  setLeadDigest(true);
                }}
                className="px-space-lg py-2 rounded bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md cursor-pointer border border-outline-variant/30"
              >
                Reset to Site Defaults
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-space-xl py-2 rounded bg-primary text-on-primary hover:bg-primary-container transition-all shadow-md font-label-md text-label-md font-semibold flex items-center gap-space-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>Save Workstation Preferences</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Hardlocked Safety Invariants (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-space-xl">
          {/* Core Safety Reassurance Card */}
          <div className="bg-inverse-surface text-inverse-on-surface rounded-lg p-space-xl shadow-lg relative overflow-hidden flex flex-col gap-space-md border border-white/10">
            <div className="absolute -right-6 -bottom-6 text-on-tertiary-fixed-variant opacity-20 pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: '160px' }}>
                verified_user
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded bg-primary-fixed-dim flex items-center justify-center text-on-primary-fixed font-bold">
                <span className="material-symbols-outlined text-xl text-primary">security</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-primary font-semibold">
                  Core Safety Protocols
                </h3>
                <span className="font-data-mono-sm text-data-mono-sm text-primary-fixed uppercase tracking-wider">
                  Mandatory & Hardcoded
                </span>
              </div>
            </div>

            <div className="p-space-md rounded bg-white/5 backdrop-blur-xs flex items-start gap-space-sm mt-space-xs border border-white/10">
              <span className="material-symbols-outlined text-primary-fixed text-lg mt-0.5 shrink-0">
                gavel
              </span>
              <p className="font-body-md text-body-md text-inverse-on-surface leading-snug">
                Core safety protections are hardcoded for patient safety and clinical integrity and cannot be silently disabled.
              </p>
            </div>

            <div className="flex items-center justify-between pt-space-xs font-data-mono-sm text-data-mono-sm text-on-surface-variant">
              <span className="text-tertiary-fixed">
                Status: <code className="text-primary-fixed">Active</code>
              </span>
              <span className="text-tertiary-fixed">Safety Controls: Enforced</span>
            </div>
          </div>

          {/* Section: Active Protections Status */}
          <section className="bg-surface-container-lowest rounded-lg p-space-xl shadow-sm flex flex-col gap-space-lg border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Active Protections Status
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                5 / 5 Hardlocked
              </span>
            </div>

            {/* 1. Scan Quality Gate */}
            <div className="p-space-md rounded-lg bg-surface-container-low flex items-start justify-between gap-space-md border border-outline-variant/20">
              <div className="flex items-start gap-space-sm">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Scan Quality Gate
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Mandatory pre-flight verification prevents uncalibrated scans from processing.
                  </span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 bg-surface-container-high px-2 py-1 rounded text-on-surface-variant font-data-mono-sm text-data-mono-sm font-semibold">
                <span className="material-symbols-outlined text-xs">lock</span>
                <span>Enforced</span>
              </div>
            </div>

            {/* 2. Human-in-the-Loop Sign-off */}
            <div className="p-space-md rounded-lg bg-surface-container-low flex items-start justify-between gap-space-md border border-outline-variant/20">
              <div className="flex items-start gap-space-sm">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Human-in-the-Loop Sign-off
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Required for all cases. Inferences cannot be auto-committed to EHR without
                    clinician review and determination.
                  </span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 bg-surface-container-high px-2 py-1 rounded text-on-surface-variant font-data-mono-sm text-data-mono-sm font-semibold">
                <span className="material-symbols-outlined text-xs">lock</span>
                <span>Enforced</span>
              </div>
            </div>

            {/* 3. Autonomous Diagnosis */}
            <div className="p-space-md rounded-lg bg-surface-container-low flex items-start justify-between gap-space-md border border-error/30">
              <div className="flex items-start gap-space-sm">
                <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center text-on-error mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-sm font-bold">block</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Autonomous Diagnosis
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Model execution without supervising physician oversight is architecturally
                    blocked.
                  </span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 bg-error-container text-on-error-container px-2 py-1 rounded font-data-mono-sm text-data-mono-sm font-semibold">
                <span className="material-symbols-outlined text-xs">lock</span>
                <span>Strictly Disabled</span>
              </div>
            </div>

            {/* 4. Low-Confidence Suppression */}
            <div className="p-space-md rounded-lg bg-surface-container-low flex items-start justify-between gap-space-md border border-outline-variant/20">
              <div className="flex items-start gap-space-sm">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Low-Confidence Suppression
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Inferences withheld below 65% certainty or when motion artifacts exceed SNR
                    threshold.
                  </span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 bg-surface-container-high px-2 py-1 rounded text-on-surface-variant font-data-mono-sm text-data-mono-sm font-semibold">
                <span className="material-symbols-outlined text-xs">lock</span>
                <span>Enforced</span>
              </div>
            </div>

            {/* 5. Decision Logging & Audit Record */}
            <div className="p-space-md rounded-lg bg-surface-container-low flex items-start justify-between gap-space-md border border-outline-variant/20">
              <div className="flex items-start gap-space-sm">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Decision Logging & Audit Record
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Demo audit records log every clinician revision, acceptance, and AI output delta.
                  </span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded font-data-mono-sm text-data-mono-sm font-semibold">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>Active</span>
              </div>
            </div>

            {/* Telemetry Footer */}
            <div className="bg-surface-container-high p-space-md rounded flex items-center justify-between">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                <span className="material-symbols-outlined text-sm">terminal</span>
                <span>
                  Attestation ID: <span className="font-semibold text-on-surface">0x4E7...A91C</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('decision-log')}
                className="text-primary hover:underline font-label-sm text-label-sm font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Ledger</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Hardware & Calibration Quickview */}
          <div className="bg-surface-container-lowest rounded-lg p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Station Calibration
              </span>
              <span className="font-data-mono-sm text-data-mono-sm text-primary font-medium">
                GSDF Calibrated
              </span>
            </div>
            <div className="grid grid-cols-3 gap-space-sm">
              <div className="flex flex-col p-space-sm rounded bg-surface-container-low">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Luminance</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">500 cd/m²</span>
                <span className="font-data-mono-sm text-data-mono-sm text-primary font-medium mt-1">
                  DICOM Compliant
                </span>
              </div>
              <div className="flex flex-col p-space-sm rounded bg-surface-container-low">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Inference Latency
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">142 ms</span>
                <span className="font-data-mono-sm text-data-mono-sm text-primary font-medium mt-1">
                  Local Enclave
                </span>
              </div>
              <div className="flex flex-col p-space-sm rounded bg-surface-container-low">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Model Version
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">v4.2.1</span>
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant mt-1">
                  Signed Binary
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded-lg shadow-xl flex items-center gap-space-md border border-primary-fixed/30 animate-in fade-in slide-in-from-bottom-4">
          <span className="w-6 h-6 rounded-full bg-primary-fixed-dim text-on-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-sm font-bold">check</span>
          </span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-inverse-on-surface">
              Workstation Preferences Saved
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Parameters broadcasted to local diagnostic workstation profile.
            </span>
          </div>
          <button
            className="text-tertiary-fixed hover:text-inverse-on-surface p-1 ml-space-sm cursor-pointer"
            onClick={() => setShowToast(false)}
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}
    </div>
  );
};
