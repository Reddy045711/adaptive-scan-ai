import React, { useState } from 'react';
import { ASSETS } from '../constants/assets';
import { Case } from '../types';
import { NavView } from './Sidebar';

interface DashboardViewProps {
  cases: Case[];
  onSelectCase: (caseItem: Case, targetView?: NavView) => void;
  onNavigate: (view: NavView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  onSelectCase,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mri' | 'ct' | 'issues'>('all');
  const [auditFilter, setAuditFilter] = useState('Recent 24h');
  const [showAuditDropdown, setShowAuditDropdown] = useState(false);

  // Compute live metrics from cases
  const activeCasesCount = cases.length;
  const awaitingReviewCount = cases.filter(
    (c) => c.clinicianStatus === 'pending' || c.qualityStatus === 'review_required'
  ).length;
  const aiAssistedCount = cases.filter((c) => c.aiStatus === 'analyzed').length;
  const qualityGateIntercepts = cases.filter((c) => c.qualityStatus === 'review_required').length;

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.scanType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clinicalTask.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'mri') return c.scanType.toLowerCase().includes('mri');
    if (selectedFilter === 'ct') return c.scanType.toLowerCase().includes('ct');
    if (selectedFilter === 'issues') return c.qualityStatus === 'review_required';
    return true;
  });

  const handleDemoPath1 = () => {
    const case1042 = cases.find((c) => c.id.includes('1042')) || cases[0];
    onSelectCase(case1042, 'quality-gate');
  };

  const handleDemoPath2 = () => {
    const case1039 = cases.find((c) => c.id.includes('1039')) || cases[1];
    onSelectCase(case1039, 'quality-gate');
  };

  return (
    <div className="relative py-space-xl flex flex-col gap-space-xl">
      {/* Top Welcome & Shift Status Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-space-xs text-primary font-data-mono-sm text-data-mono-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>SYSTEM READY • ROTATION: NEURORADIOLOGY AM-SHIFT</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            Good morning, Doctor
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Review medical scans with AI assistance while keeping clinical judgment in control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm relative">
          <div className="relative">
            <div
              className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-sm rounded-lg text-on-surface cursor-pointer select-none"
              onClick={() => setShowAuditDropdown(!showAuditDropdown)}
            >
              <span className="material-symbols-outlined text-base text-primary">filter_alt</span>
              <span className="font-label-md text-label-md">Audit Filter: {auditFilter}</span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                arrow_drop_down
              </span>
            </div>
            {showAuditDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant/30 py-1 z-30">
                {['Recent 24h', 'Recent 7 Days', 'Current Shift', 'All Studies'].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setAuditFilter(opt);
                      setShowAuditDropdown(false);
                    }}
                    className="px-space-md py-1.5 text-on-surface hover:bg-surface-container font-label-md text-label-md cursor-pointer"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('new-analysis')}
            className="flex items-center gap-space-xs bg-primary text-on-primary hover:bg-primary-container px-space-lg py-space-sm rounded-lg font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>+ New Scan Analysis</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Card 1: Active Cases */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group border border-outline-variant/20">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-surface-container-low rounded-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between z-10">
            <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Active Cases
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary material-symbols-outlined text-xl">
              radiology
            </span>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-on-surface">
                {activeCasesCount}
              </span>
              <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                in-flight
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              4 in acquisition/upload pipeline
            </p>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden z-10">
            <div className="bg-primary h-full w-[78%]"></div>
          </div>
        </div>

        {/* Card 2: Awaiting Review */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group border border-outline-variant/20">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Awaiting Review
            </span>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
              Action Needed
            </span>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-error">
                {awaitingReviewCount}
              </span>
              <span className="font-data-mono-sm text-data-mono-sm text-error">
                urgent queue
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Prioritized by triage acuity index
            </p>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden z-10">
            <div className="bg-error h-full w-[45%]"></div>
          </div>
        </div>

        {/* Card 3: AI-Assisted Cases */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group border border-outline-variant/20">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              AI-Assisted Cases
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-secondary material-symbols-outlined text-xl">
              biotech
            </span>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-on-surface">
                {aiAssistedCount}
              </span>
              <span className="font-data-mono-sm text-data-mono-sm text-primary font-semibold">
                ↑ +14% today
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant font-medium text-primary">
              94.2% clinician agreement
            </p>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden z-10">
            <div className="bg-secondary h-full w-[94.2%]"></div>
          </div>
        </div>

        {/* Card 4: Quality Gate Intercepts */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group border border-outline-variant/20">
          <div className="flex items-center justify-between z-10">
            <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Quality Gate Intercepts
            </span>
            <span className="p-1.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed material-symbols-outlined text-xl">
              shield_with_heart
            </span>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-on-surface">
                {qualityGateIntercepts}
              </span>
              <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                quarantined
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
              Inference withheld due to artifacts — Human review mandated
            </p>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden z-10">
            <div className="bg-tertiary h-full w-[28%]"></div>
          </div>
        </div>
      </div>

      {/* Safety Overview Card (Reassurance Banner) */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg relative overflow-hidden border border-outline-variant/20">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
        <div className="flex flex-col gap-space-xs pl-space-xs max-w-xl">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              AI Safety & Governance Status
            </h2>
            <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
              RESTRICTED AUTONOMY
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            System adherence to FDA SaMD Level II / EU AI Act Class IIa clinical safety protocols.
            Inferences require validated human sign-off prior to PACS dissemination.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-xs">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-space-sm py-1 rounded-lg">
            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
            <span className="font-label-sm text-label-sm text-on-surface">Quality gate active</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-low px-space-sm py-1 rounded-lg">
            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
            <span className="font-label-sm text-label-sm text-on-surface">Human review enabled</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-low px-space-sm py-1 rounded-lg">
            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
            <span className="font-label-sm text-label-sm text-on-surface">Decision logging active</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-low px-space-sm py-1 rounded-lg">
            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
            <span className="font-label-sm text-label-sm text-on-surface">
              Confidence & limitations displayed
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-error-container px-space-sm py-1 rounded-lg">
            <span className="material-symbols-outlined text-on-error-container text-base">
              cancel
            </span>
            <span className="font-label-sm text-label-sm text-on-error-container font-semibold">
              Autonomous diagnosis: DISABLED
            </span>
          </div>
        </div>
      </div>

      {/* Recent Cases Worklist Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden border border-outline-variant/20">
        {/* Table Controls */}
        <div className="p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest">
          <div className="flex flex-col">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Active Clinical Queue & Inferences
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Clinical worklist connected to local imaging queue (Demo audit record)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-base">
                search
              </span>
              <input
                className="pl-9 pr-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm outline-none w-72 focus:bg-surface-container"
                placeholder="Filter Case ID, MRN, anatomical site..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-lg">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-space-sm py-1 rounded font-label-sm text-label-sm cursor-pointer transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Scans ({cases.length})
              </button>
              <button
                onClick={() => setSelectedFilter('mri')}
                className={`px-space-sm py-1 rounded font-label-sm text-label-sm cursor-pointer transition-colors ${
                  selectedFilter === 'mri'
                    ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                MRI Brain
              </button>
              <button
                onClick={() => setSelectedFilter('ct')}
                className={`px-space-sm py-1 rounded font-label-sm text-label-sm cursor-pointer transition-colors ${
                  selectedFilter === 'ct'
                    ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                CT Angio
              </button>
              <button
                onClick={() => setSelectedFilter('issues')}
                className={`px-space-sm py-1 rounded font-label-sm text-label-sm cursor-pointer transition-colors ${
                  selectedFilter === 'issues'
                    ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Quality Issues ({qualityGateIntercepts})
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-on-surface">
            <thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="py-space-sm px-space-lg">Case ID</th>
                <th className="py-space-sm px-space-md">Scan Type</th>
                <th className="py-space-sm px-space-md">Quality Gate Status</th>
                <th className="py-space-sm px-space-md">AI Model Output</th>
                <th className="py-space-sm px-space-md text-right">Confidence</th>
                <th className="py-space-sm px-space-md">Clinician Status</th>
                <th className="py-space-sm px-space-md">Last Updated</th>
                <th className="py-space-sm px-space-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 text-body-sm font-body-sm">
              {filteredCases.map((c) => {
                const isQualityFail = c.qualityStatus === 'review_required';
                return (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      isQualityFail
                        ? 'bg-error-container/20 hover:bg-error-container/30'
                        : 'hover:bg-surface-container-low/60'
                    }`}
                  >
                    <td className="py-space-md px-space-lg">
                      <div className="flex flex-col">
                        <span
                          className={`font-data-mono-md text-data-mono-md font-bold ${
                            isQualityFail ? 'text-error' : 'text-primary'
                          }`}
                        >
                          {c.id}
                        </span>
                        <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                          {c.mrn}
                        </span>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-base text-tertiary">
                          {c.scanType.includes('CT') ? 'cardiology' : 'neurology'}
                        </span>
                        <span className="font-medium text-on-surface">{c.scanType}</span>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md">
                      {c.qualityStatus === 'ready' ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded bg-primary-fixed/50 text-on-primary-fixed-variant font-data-mono-sm text-data-mono-sm font-medium w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            Ready (Checks Passed)
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-mono">Demo quality score — not a clinical measurement</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded bg-error-container text-on-error-container font-data-mono-sm text-data-mono-sm font-medium w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                            Review Required (Inference Blocked)
                          </span>
                          <span className="text-[10px] text-error font-mono">Demo quality score — not a clinical measurement</span>
                        </div>
                      )}
                    </td>

                    <td className="py-space-md px-space-md">
                      {c.aiStatus === 'analyzed' ? (
                        <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-data-mono-sm text-data-mono-sm font-medium">
                          <span className="material-symbols-outlined text-xs">auto_awesome</span>
                          Analyzed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-error-container text-on-error-container font-data-mono-sm text-data-mono-sm font-semibold">
                          <span className="material-symbols-outlined text-xs">lock</span>
                          Inference Withheld
                        </span>
                      )}
                    </td>

                    <td
                      className={`py-space-md px-space-md text-right font-data-mono-md text-data-mono-md ${
                        c.confidence ? 'font-semibold text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {c.confidence ? `${c.confidence}%` : '—'}
                    </td>

                    <td className="py-space-md px-space-md">
                      {c.clinicianStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                          Pending Review
                        </span>
                      )}
                      {c.clinicianStatus === 'accepted' && (
                        <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-xs">check</span>
                          Reviewed (Accepted)
                        </span>
                      )}
                      {c.clinicianStatus === 'corrected' && (
                        <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-secondary-fixed-dim text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-xs">edit_note</span>
                          Reviewed (Corrected)
                        </span>
                      )}
                      {c.clinicianStatus === 'overridden' && (
                        <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-xs">gavel</span>
                          Human Overridden
                        </span>
                      )}
                      {c.clinicianStatus === 'escalated' && (
                        <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-xs text-error">
                            priority_high
                          </span>
                          Human Review Mandated
                        </span>
                      )}
                    </td>

                    <td className="py-space-md px-space-md font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                      {c.lastUpdated}
                    </td>

                    <td className="py-space-md px-space-lg text-right">
                      {isQualityFail ? (
                        <button
                          onClick={() => onSelectCase(c, 'quality-gate')}
                          className="px-space-md py-1 rounded bg-error text-on-error hover:bg-on-error-container transition-colors font-label-sm text-label-sm font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1"
                        >
                          <span>Inspect Quality</span>
                          <span className="material-symbols-outlined text-sm">troubleshoot</span>
                        </button>
                      ) : c.clinicianStatus === 'pending' ? (
                        <button
                          onClick={() => onSelectCase(c, 'ai-findings-review')}
                          className="px-space-md py-1 rounded bg-primary text-on-primary hover:bg-primary-container transition-colors font-label-sm text-label-sm font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1"
                        >
                          <span>Review Scan</span>
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectCase(c, 'decision-log')}
                          className="px-space-md py-1 rounded bg-surface-container-high text-on-surface hover:bg-surface-container transition-colors font-label-sm text-label-sm font-medium cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>View Log</span>
                          <span className="material-symbols-outlined text-sm">history</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination / Footer */}
        <div className="px-space-lg py-space-sm bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
            Showing {filteredCases.length} of {cases.length} active clinical cases
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 bg-surface-container-lowest text-on-surface rounded font-label-sm text-label-sm cursor-pointer disabled:opacity-40"
              disabled
            >
              Previous
            </button>
            <span className="font-data-mono-sm text-data-mono-sm text-on-surface font-semibold px-2">
              Page 1 of 1
            </span>
            <button
              className="px-2 py-1 bg-surface-container-lowest text-on-surface rounded font-label-sm text-label-sm cursor-pointer disabled:opacity-40"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Quick Scan Preview Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Left 2 Cols: Clinical Provenance Breakdown */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-xl">schema</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                System Assurance & Active Protocol Matrix
              </h3>
            </div>
            <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
              STATION: DICOM-DX-04
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
            <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Artifact Sensitivity
                </span>
                <span className="font-data-mono-sm text-data-mono-sm font-semibold text-primary">
                  Ultra-High
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Threshold set at SNR &gt; 24.2 dB. Automatically trips Quality Gate on motion blur.
              </p>
              <div className="mt-auto pt-2 flex items-center gap-1 text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>Parametric Profile: 08-Neuro</span>
              </div>
            </div>

            <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Inference Governance
                </span>
                <span className="font-data-mono-sm text-data-mono-sm font-semibold text-secondary">
                  Dual-Locked
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Autonomous export blocked. Requires Staff Physician review determination.
              </p>
              <div className="mt-auto pt-2 flex items-center gap-1 text-secondary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-sm">security</span>
                <span>SaMD Verification Level II</span>
              </div>
            </div>

            <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Model Confidence Delta
                </span>
                <span className="font-data-mono-sm text-data-mono-sm font-semibold text-on-surface">
                  ±2.1%
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Clinical boundary calibration calibrated against 140,000 multi-center validated
                scans.
              </p>
              <div className="mt-auto pt-2 flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-sm">update</span>
                <span>Model: SynapseDense-v4.2</span>
              </div>
            </div>
          </div>

          {/* Micro Sparkline SVG Visualization */}
          <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Clinician Agreement Trend (Last 7 Days)
              </span>
              <span className="font-data-mono-sm text-data-mono-sm text-primary font-bold">
                Average: 93.8%
              </span>
            </div>
            <div className="h-14 w-full">
              <svg
                className="w-full h-full text-primary"
                preserveAspectRatio="none"
                viewBox="0 0 500 60"
              >
                <path
                  d="M0,45 Q50,40 100,32 T200,28 T300,38 T400,20 T500,16"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                ></path>
                <path
                  d="M0,45 Q50,40 100,32 T200,28 T300,38 T400,20 T500,16 L500,60 L0,60 Z"
                  fill="currentColor"
                  fillOpacity="0.08"
                ></path>
                <circle cx="100" cy="32" fill="currentColor" r="3.5"></circle>
                <circle cx="200" cy="28" fill="currentColor" r="3.5"></circle>
                <circle cx="300" cy="38" fill="currentColor" r="3.5"></circle>
                <circle cx="400" cy="20" fill="currentColor" r="3.5"></circle>
                <circle cx="500" cy="16" fill="currentColor" r="4.5"></circle>
              </svg>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Priority Case Spotlight Card */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between gap-space-md border border-outline-variant/20">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Priority Case Spotlight
              </span>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-data-mono-sm text-data-mono-sm font-semibold">
                Flagged #1039
              </span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">
              Motion Artifact Intercept
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              FLAIR sequence contains significant patient translation artifacts across axial slices
              18–26.
            </p>
          </div>

          <div className="relative w-full h-36 rounded-lg overflow-hidden bg-inverse-surface flex items-center justify-center">
            <img
              alt="Motion Artifact Spotlight"
              className="w-full h-full object-cover opacity-85"
              src={ASSETS.scanSpotlight1039}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-transparent to-transparent"></div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-on-primary">
              <span className="font-data-mono-sm text-data-mono-sm bg-inverse-surface/80 px-1.5 py-0.5 rounded">
                SL: 22/36
              </span>
              <span className="font-data-mono-sm text-[10px] bg-error/90 text-on-error px-1.5 py-0.5 rounded font-bold">
                DEMO SCORE: 42 (NOT CLINICAL)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>Action mandated:</span>
              <span className="font-medium text-error">Clinician override or rescan</span>
            </div>
            <button
              onClick={handleDemoPath2}
              className="w-full py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">zoom_in</span>
              <span>Open Artifact Inspector</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hackathon Clinical Demo Switcher Bar */}
      <div className="sticky bottom-4 z-30 bg-inverse-surface text-inverse-on-surface p-space-md rounded-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-md backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-space-md">
          <div className="p-2 rounded-lg bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">route</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-primary-fixed uppercase tracking-wider font-semibold">
              Hackathon Clinical Demo Switcher
            </span>
            <span className="font-body-sm text-body-sm text-inverse-on-surface/80">
              Select an end-to-end evaluation flow to test clinician-governed AI handoffs:
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleDemoPath1}
            className="flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base">task_alt</span>
            <span>Demo Path 1: Standard AI Review (#1042)</span>
          </button>
          <button
            onClick={handleDemoPath2}
            className="flex items-center gap-2 px-space-md py-2 rounded-lg bg-error hover:bg-error-container hover:text-on-error-container text-on-error font-label-md text-label-md font-semibold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base">shield</span>
            <span>Demo Path 2: Quality Gate Failure (#1039)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
