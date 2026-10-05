import React, { useState } from 'react';
import { Case, AssistanceMode } from '../types';
import { DEFAULT_AI_FINDING } from '../services/aiService';
import { REAL_NVIDIA_BRATS_RESULT } from '../services/nvidiaResultService';
import { NavView } from './Sidebar';

interface AssistanceSelectionViewProps {
  currentCase: Case;
  onNavigate: (view: NavView) => void;
  onUpdateCase: (updated: Case) => void;
}

export const AssistanceSelectionView: React.FC<AssistanceSelectionViewProps> = ({
  currentCase,
  onNavigate,
  onUpdateCase,
}) => {
  const [selectedMode, setSelectedMode] = useState<AssistanceMode>(
    currentCase.assistanceMode || 'explain'
  );
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);

  const handleSelectMode = (mode: AssistanceMode) => {
    setSelectedMode(mode);
    onUpdateCase({
      ...currentCase,
      assistanceMode: mode,
    });
  };

  const handleStartAnalysis = () => {
    setIsStartingAnalysis(true);
    onUpdateCase({
      ...currentCase,
      assistanceMode: selectedMode,
      aiStatus: 'analyzed',
      aiFinding: currentCase.aiFinding || DEFAULT_AI_FINDING,
      nvidiaResult: currentCase.nvidiaResult || REAL_NVIDIA_BRATS_RESULT,
    });
    setTimeout(() => {
      setIsStartingAnalysis(false);
      onNavigate('ai-findings-review');
    }, 700);
  };

  return (
    <div className="py-space-xl flex flex-col gap-space-xl max-w-7xl mx-auto w-full pb-16">
      {/* Top Stepper & Case Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/20">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed">
            <span className="material-symbols-outlined text-xl">tune</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-data-mono-sm text-data-mono-sm uppercase text-primary font-semibold tracking-wider">
                Step 4 of 6
              </span>
              <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">•</span>
              <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant font-medium">
                Assistance Selection
              </span>
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface">
              {currentCase.id}: {currentCase.scanType}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-lg">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-7 h-1.5 rounded-full bg-primary"></div>
            <div className="w-7 h-1.5 rounded-full bg-primary"></div>
            <div className="w-7 h-1.5 rounded-full bg-primary"></div>
            <div className="w-7 h-1.5 rounded-full bg-primary"></div>
            <div className="w-7 h-1.5 rounded-full bg-surface-container-high"></div>
            <div className="w-7 h-1.5 rounded-full bg-surface-container-high"></div>
          </div>
          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-low text-on-surface-variant border border-outline-variant/30">
            <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
            <span className="font-data-mono-sm text-data-mono-sm font-medium">
              Quality Gate: Cleared (Demo score {currentCase.qualityScore}/100 — not a clinical measurement)
            </span>
          </div>
        </div>
      </div>

      {/* Screen Header & Autonomy Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center gap-space-xs">
          <div className="inline-flex items-center gap-space-xs">
            <span className="px-space-sm py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-data-mono-sm text-data-mono-sm font-semibold tracking-wide uppercase">
              Interactive Triaging Mode
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            Choose Assistance Level
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Select how much AI support you want for this case.
          </p>
        </div>

        {/* Clinician Autonomy Reassurance Box */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex items-start gap-space-md relative overflow-hidden border border-outline-variant/20">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-surface-container-low pointer-events-none"></div>
          <div className="p-space-sm rounded bg-surface-container-high text-primary shrink-0">
            <span className="material-symbols-outlined text-xl">gavel</span>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-on-surface font-semibold uppercase tracking-wider">
                Clinician Autonomy Protocol
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              You choose the assistance level. The system does not infer your clinical expertise or
              make assumptions about your ability.
            </p>
            <span className="font-data-mono-sm text-data-mono-sm text-primary font-medium mt-1">
              Autonomous Inference Override: Permitted Anytime
            </span>
          </div>
        </div>
      </div>

      {/* Mode Selection Grid (3 Bespoke Architectural Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
        {/* CARD 1: FOCUSED */}
        <div
          onClick={() => handleSelectMode('focused')}
          className={`group cursor-pointer flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl transition-all duration-200 border ${
            selectedMode === 'focused'
              ? 'ring-2 ring-primary shadow-lg bg-surface-container-lowest border-primary'
              : 'border-outline-variant/20 shadow-sm hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <span className="font-data-mono-sm text-data-mono-sm uppercase text-on-surface-variant font-semibold tracking-wider">
                Tier 1 • Rapid
              </span>
              <span
                className={`px-2 py-0.5 rounded font-data-mono-sm text-data-mono-sm font-semibold ${
                  selectedMode === 'focused'
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {selectedMode === 'focused' ? 'Active Selection' : 'Inactive'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-2xl text-on-surface">speed</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  FOCUSED
                </h2>
              </div>
              <span className="font-label-md text-label-md text-primary font-semibold">
                Concise Decision-Oriented
              </span>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant min-h-[54px]">
              Minimal, high-speed assistance tailored for rapid triaging.
            </p>

            <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold">
                Included Inference Scope
              </span>
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Key diagnostic findings
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Confidence distribution metrics
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Critical scanning limitations
                  </span>
                </div>
              </div>
            </div>

            <div className="p-space-sm rounded bg-surface-container-high flex items-center justify-between text-on-surface-variant">
              <div className="flex flex-col">
                <span className="font-data-mono-sm text-data-mono-sm">Latency Target</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  &lt; 350ms per series
                </span>
              </div>
              <svg className="w-20 h-7 text-primary" fill="none" viewBox="0 0 100 28">
                <path
                  d="M0 20 L25 18 L50 6 L75 14 L100 4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                ></path>
              </svg>
            </div>
          </div>

          <div className="mt-space-xl pt-space-md">
            <button
              type="button"
              className={`w-full py-2.5 px-space-md rounded font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedMode === 'focused'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {selectedMode === 'focused' ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>{selectedMode === 'focused' ? 'Selected as Active Mode' : 'Select Focused'}</span>
            </button>
          </div>
        </div>

        {/* CARD 2: EXPLAIN (RECOMMENDED DEFAULT) */}
        <div
          onClick={() => handleSelectMode('explain')}
          className={`group cursor-pointer flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl relative transition-all duration-200 border ${
            selectedMode === 'explain'
              ? 'ring-2 ring-primary shadow-lg bg-surface-container-lowest border-primary'
              : 'border-outline-variant/20 shadow-sm hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary px-space-md py-0.5 rounded-full font-data-mono-sm text-data-mono-sm font-semibold tracking-wide uppercase shadow-sm flex items-center gap-1 z-10">
            <span className="material-symbols-outlined text-sm">recommend</span>
            <span>RECOMMENDED DEFAULT</span>
          </div>

          <div className="flex flex-col gap-space-md pt-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-data-mono-sm text-data-mono-sm uppercase text-primary font-semibold tracking-wider">
                Tier 2 • Contextual
              </span>
              <span
                className={`px-2 py-0.5 rounded font-data-mono-sm text-data-mono-sm font-semibold ${
                  selectedMode === 'explain'
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {selectedMode === 'explain' ? 'Active Selection' : 'Inactive'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-2xl text-primary">balance</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  EXPLAIN
                </h2>
              </div>
              <span className="font-label-md text-label-md text-primary font-semibold">
                Balanced Assistance & Context
              </span>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant min-h-[54px]">
              Comprehensive balance between speed, contextual evidence, and rationale.
            </p>

            <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold">
                Included Inference Scope
              </span>
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Key findings with anatomical anchors
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Confidence metrics with voxel heatmap
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Why the finding may matter (clinical implications)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Peer-reviewed evidence summary
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Model algorithmic limitations & edge priors
                  </span>
                </div>
              </div>
            </div>

            <div className="p-space-sm rounded bg-surface-container-high flex items-center justify-between text-on-surface-variant">
              <div className="flex flex-col">
                <span className="font-data-mono-sm text-data-mono-sm">Context Density</span>
                <span className="font-label-md text-label-md text-primary font-semibold">
                  Optimal for Clinical Shift
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-3.5 rounded-sm bg-primary"></span>
                <span className="w-1.5 h-5 rounded-sm bg-primary"></span>
                <span className="w-1.5 h-6 rounded-sm bg-primary"></span>
                <span className="w-1.5 h-4 rounded-sm bg-primary-fixed-dim"></span>
                <span className="w-1.5 h-2.5 rounded-sm bg-outline-variant"></span>
              </div>
            </div>
          </div>

          <div className="mt-space-xl pt-space-md">
            <button
              type="button"
              className={`w-full py-2.5 px-space-md rounded font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedMode === 'explain'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {selectedMode === 'explain' ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>{selectedMode === 'explain' ? 'Selected as Active Mode' : 'Select Explain'}</span>
            </button>
          </div>
        </div>

        {/* CARD 3: REVIEW */}
        <div
          onClick={() => handleSelectMode('review')}
          className={`group cursor-pointer flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl transition-all duration-200 border ${
            selectedMode === 'review'
              ? 'ring-2 ring-primary shadow-lg bg-surface-container-lowest border-primary'
              : 'border-outline-variant/20 shadow-sm hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <span className="font-data-mono-sm text-data-mono-sm uppercase text-on-surface-variant font-semibold tracking-wider">
                Tier 3 • Exhaustive
              </span>
              <span
                className={`px-2 py-0.5 rounded font-data-mono-sm text-data-mono-sm font-semibold ${
                  selectedMode === 'review'
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {selectedMode === 'review' ? 'Active Selection' : 'Inactive'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-2xl text-on-surface">
                  search_insights
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  REVIEW
                </h2>
              </div>
              <span className="font-label-md text-label-md text-primary font-semibold">
                Detailed Deep-Dive Assistance
              </span>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant min-h-[54px]">
              Full audit and differential exploration for complex or ambiguous presentations.
            </p>

            <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold">
                Included Inference Scope
              </span>
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Findings & granular evidence breakdown
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Segmental confidence intervals (95% CI)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Detailed model limits & anomaly bounds
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Alternative diagnostic considerations
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Interactive review verification questions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Detailed sign-off verification checklist
                  </span>
                </div>
              </div>
            </div>

            <div className="p-space-sm rounded bg-surface-container-high flex items-center justify-between text-on-surface-variant">
              <div className="flex flex-col">
                <span className="font-data-mono-sm text-data-mono-sm">Audit Coverage</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  100% Granular Differential
                </span>
              </div>
              <div className="flex items-center gap-1 font-data-mono-sm text-data-mono-sm text-primary font-semibold">
                <span className="material-symbols-outlined text-base">checklist</span>
                <span>7/7 Gates</span>
              </div>
            </div>
          </div>

          <div className="mt-space-xl pt-space-md">
            <button
              type="button"
              className={`w-full py-2.5 px-space-md rounded font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedMode === 'review'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {selectedMode === 'review' ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span>{selectedMode === 'review' ? 'Selected as Active Mode' : 'Select Review'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Dynamic Feature Comparison Matrix */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary">compare_arrows</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">
              Assistance Matrix Breakdown
            </span>
            <span className="px-space-sm py-0.5 rounded bg-surface-container-high text-on-surface-variant font-data-mono-sm text-data-mono-sm">
              Non-Destructive Mode
            </span>
          </div>
          <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
            Protocol Version 4.2.1 • Compliant with DICOM-SR Part 15
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="p-space-sm rounded-l">Assistance Capability</th>
                <th className="p-space-sm text-center">FOCUSED</th>
                <th className="p-space-sm text-center bg-surface-container text-primary font-bold">
                  EXPLAIN (DEFAULT)
                </th>
                <th className="p-space-sm text-center rounded-r">REVIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 text-on-surface font-body-md">
              <tr className="hover:bg-surface-container-low/50">
                <td className="p-space-sm font-medium">Volumetric Segmentation Overlays</td>
                <td className="p-space-sm text-center text-primary">
                  <span className="material-symbols-outlined text-base align-middle">check</span>
                </td>
                <td className="p-space-sm text-center text-primary bg-surface-container/50 font-semibold">
                  <span className="material-symbols-outlined text-base align-middle">check</span>
                </td>
                <td className="p-space-sm text-center text-primary">
                  <span className="material-symbols-outlined text-base align-middle">check</span>
                </td>
              </tr>
              <tr className="bg-surface-container-lowest hover:bg-surface-container-low/50">
                <td className="p-space-sm font-medium">Statistical Confidence & Thresholds</td>
                <td className="p-space-sm text-center text-primary">
                  <span className="material-symbols-outlined text-base align-middle">check</span>
                </td>
                <td className="p-space-sm text-center text-primary bg-surface-container/50 font-semibold">
                  <span className="material-symbols-outlined text-base align-middle">check</span>
                </td>
                <td className="p-space-sm text-center text-primary">
                  <span className="material-symbols-outlined text-base align-middle">check</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/50">
                <td className="p-space-sm font-medium">Evidence Summaries & Anatomical Relevance</td>
                <td className="p-space-sm text-center text-outline-variant">—</td>
                <td className="p-space-sm text-center text-primary bg-surface-container/50 font-semibold">
                  <span className="material-symbols-outlined text-base align-middle">check</span>
                </td>
                <td className="p-space-sm text-center text-primary">
                  <span className="material-symbols-outlined text-base align-middle">check</span>
                </td>
              </tr>
              <tr className="bg-surface-container-lowest hover:bg-surface-container-low/50">
                <td className="p-space-sm font-medium">Differential Diagnosis Prompts</td>
                <td className="p-space-sm text-center text-outline-variant">—</td>
                <td className="p-space-sm text-center text-outline-variant bg-surface-container/50">—</td>
                <td className="p-space-sm text-center text-primary">
                  <span className="material-symbols-outlined text-base align-middle">check</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/50">
                <td className="p-space-sm font-medium">Interactive Clinician Checklist Gate</td>
                <td className="p-space-sm text-center text-outline-variant">—</td>
                <td className="p-space-sm text-center text-outline-variant bg-surface-container/50">—</td>
                <td className="p-space-sm text-center text-primary">
                  <span className="material-symbols-outlined text-base align-middle">check</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Note Panel */}
      <div className="p-space-md rounded-xl bg-surface-container-high text-on-surface flex items-center justify-between gap-space-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold">
              Active Session Flexibility
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Assistance level can be adjusted at any point during active case examination without
              resetting annotations.
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-lowest text-primary">
          <span className="material-symbols-outlined text-base">sync</span>
          <span className="font-data-mono-sm text-data-mono-sm font-semibold">Live State Sync</span>
        </div>
      </div>

      {/* Bottom Actions Sticky/Nav Section */}
      <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-md">
        <button
          onClick={() => onNavigate('quality-gate')}
          className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-label-md font-semibold shadow-sm cursor-pointer border border-outline-variant/30"
          type="button"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Back to Quality Gate</span>
        </button>

        <div className="flex items-center gap-space-md">
          <span className="hidden md:inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>Selected: {selectedMode.toUpperCase()} Mode</span>
          </span>
          <button
            onClick={handleStartAnalysis}
            disabled={isStartingAnalysis}
            className="inline-flex items-center gap-space-sm px-space-xl py-2.5 rounded bg-primary text-on-primary hover:bg-primary-container transition-all font-label-md text-label-md font-semibold shadow-md hover:shadow-lg cursor-pointer disabled:opacity-75"
            type="button"
          >
            {isStartingAnalysis ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                <span>Initializing {selectedMode.toUpperCase()} Pipeline...</span>
              </>
            ) : (
              <>
                <span>Start AI Analysis</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
