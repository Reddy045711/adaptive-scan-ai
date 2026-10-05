import React, { useState } from 'react';
import { ASSETS } from '../constants/assets';
import { Case, DecisionLogEvent } from '../types';
import { exportAuditPackNDJSON } from '../services/storageService';

interface DecisionLogViewProps {
  cases: Case[];
  events: DecisionLogEvent[];
}

export const DecisionLogView: React.FC<DecisionLogViewProps> = ({ cases, events }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportFeedback, setExportFeedback] = useState(false);

  const handleExport = () => {
    const data = exportAuditPackNDJSON();
    const blob = new Blob([data], { type: 'application/x-ndjson;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `adaptive-scan-audit-pack-${Date.now()}.ndjson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportFeedback(true);
    setTimeout(() => setExportFeedback(false), 3000);
  };

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        e.caseId.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterType === 'ai') return e.type === 'ai_inference';
    if (filterType === 'review_required') return e.type === 'intercept' || e.type === 'escalation';
    if (filterType === 'accepted') return e.description.toLowerCase().includes('accept');
    if (filterType === 'corrected') return e.description.toLowerCase().includes('correct');
    if (filterType === 'rejected') return e.description.toLowerCase().includes('reject');
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Top Governance Header & Compliance Banner */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between py-space-lg gap-space-md">
        <div className="flex flex-col gap-1 max-w-3xl">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-data-mono-sm text-data-mono-sm">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold tracking-wider uppercase">
              Decision Log — Demo Audit Record
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Clinician Review Recorded
            </span>
            <span>•</span>
            <span className="text-on-surface-variant">Demo audit record</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            Decision Log
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Audit record of AI advisory inferences, quality gate assessments, and clinician review determinations. (Demo audit record)
          </p>
        </div>

        {/* Quick Stats Metric Chips */}
        <div className="flex items-center gap-space-sm flex-wrap self-start xl:self-end">
          <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-xl">fact_check</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                Record Type
              </span>
              <span className="font-data-mono-md text-data-mono-md font-bold text-on-surface">
                Decision Log — Demo Audit Record
              </span>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors font-label-md text-label-md font-semibold shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            <span>Export Audit Pack (.ndjson)</span>
          </button>
        </div>
      </div>

      {/* Filter & Control Toolbar */}
      <div className="mt-space-sm flex flex-col gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/20">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          {/* Filter Pills Group */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All (${events.length})` },
              { id: 'ai', label: 'AI Analyzed (42)' },
              { id: 'review_required', label: 'Review Required (5)', hasDot: true },
              { id: 'accepted', label: 'Accepted (31)' },
              { id: 'corrected', label: 'Corrected (8)' },
              { id: 'rejected', label: 'Rejected (3)' },
            ].map((p) => {
              const active = filterType === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setFilterType(p.id)}
                  className={`px-space-md py-1 rounded font-label-sm text-label-sm transition-all cursor-pointer flex items-center gap-1 ${
                    active
                      ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-medium'
                  }`}
                  type="button"
                >
                  {p.hasDot && <span className="w-1.5 h-1.5 rounded-full bg-error"></span>}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="flex items-center bg-surface-container-low rounded px-space-sm py-1 gap-space-xs text-on-surface font-data-mono-sm text-data-mono-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-base">search</span>
            <input
              className="bg-transparent text-on-surface placeholder:text-on-surface-variant focus:outline-none w-48 font-data-mono-sm text-data-mono-sm"
              placeholder="Search Hash / Case ID..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Featured Case Audit Detail View (Case #1042) */}
      <div className="mt-space-lg flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex p-1 rounded bg-primary-container text-on-primary">
              <span className="material-symbols-outlined text-base">inventory</span>
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Case #1042 · Full Event Lifecycle Audit
            </h2>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="font-data-mono-sm text-data-mono-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
              UUID: 4a9f-881c-99d0-bc21e
            </span>
            <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
              Recorded Today, 08:48 UTC
            </span>
          </div>
        </div>

        {/* Summary Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* AI Finding Card */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/20">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  AI Finding & Model
                </span>
                <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary font-data-mono-sm text-data-mono-sm font-semibold">
                  NVIDIA BraTS
                </span>
              </div>
              <span className="font-headline-sm text-sm font-bold text-on-surface mt-1 leading-snug">
                Automated MRI segmentation identified distinct tumor-associated regions
              </span>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                WT: 94.97 mL · TC: 52.18 mL · ET: 28.47 mL
              </p>
            </div>
            <div className="mt-space-md pt-space-sm flex items-center justify-between bg-surface-container-low p-space-sm rounded-lg">
              <span className="font-label-sm text-label-sm text-on-surface">Assistance Mode</span>
              <span className="font-data-mono-sm text-data-mono-sm font-bold text-primary">
                Explain (Interactive)
              </span>
            </div>
          </div>

          {/* Evaluation Dice & Metrics Card */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Model Evaluation (Dice)
                </span>
                <span className="material-symbols-outlined text-secondary text-lg">insights</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display-lg text-display-lg font-bold text-on-surface leading-none font-mono">
                  0.9513
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Whole Tumor Dice
                </span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-primary h-full rounded-full" style={{ width: '95.1%' }}></div>
              </div>
            </div>
            <div className="mt-space-md flex flex-col gap-0.5 font-data-mono-sm text-data-mono-sm text-on-surface-variant">
              <span>TC Dice: 0.9584 · ET Dice: 0.8722</span>
              <span className="text-[10px] text-secondary font-semibold">Evaluation metric, not patient confidence</span>
            </div>
          </div>

          {/* Clinician Action Card */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Clinician Action
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-data-mono-sm text-data-mono-sm font-semibold capitalize">
                  {cases.find((c) => c.id.includes('1042'))?.clinicianStatus || 'Recorded'}
                </span>
              </div>
              <div className="mt-2 text-on-surface font-body-md text-xs bg-surface-container-low p-space-sm rounded-lg leading-snug">
                "{cases.find((c) => c.id.includes('1042'))?.clinicianDecision?.note || 'Clinician review recorded under demonstration protocol.'}"
              </div>
            </div>
            <div className="mt-space-sm flex items-center gap-1 text-on-surface-variant font-data-mono-sm text-data-mono-sm">
              <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
              <span>Clinician determination logged</span>
            </div>
          </div>

          {/* Review Status Card */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/20">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Review Status
                </span>
                <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-primary-fixed text-on-primary-fixed font-data-mono-sm text-data-mono-sm font-bold tracking-wide uppercase">
                <span className="material-symbols-outlined text-sm">check</span>
                <span>Clinician Review Recorded</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded-lg">
              <img
                alt="Demo Clinician"
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-primary/30"
                src={ASSETS.doctorAvatar}
              />
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                  Demo Clinician
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Clinician Review
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace Split: Sequential Audit Timeline & Scan Inspection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mt-space-sm">
          {/* Left 7 Cols: Chronological Step-by-Step Audit Timeline */}
          <div className="lg:col-span-7 flex flex-col bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-lg">history_edu</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Sequential Audit Trace
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                  {filteredEvents.length} Recorded States
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 flex flex-col gap-space-lg before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-container-high">
              {filteredEvents.map((evt, idx) => (
                <div key={evt.id} className="relative flex flex-col gap-1">
                  <span
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center font-data-mono-sm text-[10px] font-bold ${
                      evt.badgeType === 'error'
                        ? 'bg-error text-on-error'
                        : evt.badgeType === 'primary'
                        ? 'bg-primary text-on-primary'
                        : evt.badgeType === 'secondary'
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {evt.title}
                    </span>
                    <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant bg-surface-container-low px-1.5 py-0.5 rounded">
                      {evt.timestamp}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {evt.description}
                  </p>
                  {evt.badge && (
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded font-data-mono-sm text-data-mono-sm font-semibold ${
                          evt.badgeType === 'error'
                            ? 'bg-error-container text-on-error-container'
                            : evt.badgeType === 'primary'
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {evt.badge}
                      </span>
                      {evt.hash && (
                        <span className="font-data-mono-sm text-[10px] text-on-surface-variant truncate max-w-xs">
                          Record: {evt.hash.substring(0, 16)}...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Case Audit Record & Review Receipt */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-lg">medical_information</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Case Audit Summary
                  </span>
                </div>
                <span className="font-data-mono-sm text-data-mono-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  Case #1042
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-on-surface font-body-sm p-space-xs rounded bg-surface-container-low">
                  <span>Modality:</span>
                  <span className="font-data-mono-sm font-semibold">MRI Brain · 3.0T FLAIR</span>
                </div>
                <div className="flex items-center justify-between text-on-surface font-body-sm p-space-xs rounded bg-surface-container-low">
                  <span>Quality Gate:</span>
                  <span className="font-data-mono-sm font-semibold text-primary">
                    Passed (Demo quality score — not a clinical measurement)
                  </span>
                </div>
                <div className="flex items-center justify-between text-on-surface font-body-sm p-space-xs rounded bg-surface-container-low">
                  <span>Verified Volumes:</span>
                  <span className="font-data-mono-sm font-semibold text-primary">
                    WT 94.97 mL · TC 52.18 mL · ET 28.47 mL
                  </span>
                </div>
                <div className="flex items-center justify-between text-on-surface font-body-sm p-space-xs rounded bg-surface-container-low">
                  <span>Model Evaluation:</span>
                  <span className="font-data-mono-sm font-semibold text-secondary">
                    WT Dice: 0.9513 · Case: BraTS2021_00495
                  </span>
                </div>
              </div>

              <div className="p-space-xs rounded bg-surface-container-low text-[11px] text-on-surface-variant font-mono">
                Dice scores are evaluation metrics and are not patient-specific confidence scores.
              </div>
            </div>

            {/* Clinician Review Record */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Review Record Receipt
                </span>
                <span className="font-data-mono-sm text-data-mono-sm text-primary font-bold">
                  REC #819,410
                </span>
              </div>
              <div className="p-space-sm rounded bg-surface-container font-data-mono-sm text-[10px] text-on-surface-variant leading-relaxed break-all">
                0x4b79c32890ef9923aae8817342910fdce194038194ad9b1f204cba816d90e87140b9231f88726acbed
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Attested under Protocol:
                </span>
                <span className="font-data-mono-sm text-data-mono-sm font-semibold text-on-surface">
                  Adaptive Scan AI Demo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Historic Audit Records Table */}
      <div className="mt-space-xl flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex p-1 rounded bg-surface-container-high text-on-surface">
              <span className="material-symbols-outlined text-base">table_view</span>
            </span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Historic Case Audit Ledger
            </h3>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Showing evaluated cases ({cases.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-space-md px-space-lg">Case ID</th>
                <th className="py-space-md px-space-md">Timestamp</th>
                <th className="py-space-md px-space-md">AI Finding & Conf.</th>
                <th className="py-space-md px-space-md">Assistance Mode</th>
                <th className="py-space-md px-space-md">Clinician Decision</th>
                <th className="py-space-md px-space-md">Reason Code / Action Details</th>
                <th className="py-space-md px-space-md">Reviewing Clinician</th>
                <th className="py-space-md px-space-lg text-right">Audit Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y-0 text-on-surface font-body-sm text-body-sm">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-space-md px-space-lg font-data-mono-sm text-data-mono-sm font-bold text-on-surface">
                    {c.id}
                  </td>
                  <td className="py-space-md px-space-md font-data-mono-sm text-data-mono-sm text-on-surface-variant whitespace-nowrap">
                    {c.createdAt}
                  </td>
                  <td className="py-space-md px-space-md whitespace-nowrap">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-medium text-on-surface">
                        {c.aiFinding ? c.aiFinding.title : 'Inference Withheld'}
                      </span>
                      {c.confidence && (
                        <span className="font-data-mono-sm text-data-mono-sm px-1.5 py-0.2 rounded bg-surface-container text-primary font-semibold">
                          {c.confidence}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-space-md px-space-md whitespace-nowrap font-data-mono-sm text-data-mono-sm text-on-surface-variant capitalize">
                    {c.assistanceMode}
                  </td>
                  <td className="py-space-md px-space-md whitespace-nowrap">
                    {c.clinicianStatus === 'accepted' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
                        <span className="material-symbols-outlined text-xs">check</span>
                        Accepted
                      </span>
                    )}
                    {c.clinicianStatus === 'corrected' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
                        <span className="material-symbols-outlined text-xs">edit</span>
                        Corrected
                      </span>
                    )}
                    {c.clinicianStatus === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-on-error-container font-data-mono-sm text-data-mono-sm font-semibold">
                        <span className="material-symbols-outlined text-xs">close</span>
                        Rejected
                      </span>
                    )}
                    {c.clinicianStatus === 'overridden' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
                        <span className="material-symbols-outlined text-xs">gavel</span>
                        Overridden
                      </span>
                    )}
                    {c.clinicianStatus === 'escalated' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-on-error-container font-data-mono-sm text-data-mono-sm font-semibold">
                        <span className="material-symbols-outlined text-xs">priority_high</span>
                        Escalated
                      </span>
                    )}
                    {c.clinicianStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container/40 text-on-secondary-container font-data-mono-sm text-data-mono-sm font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant max-w-xs truncate">
                    {c.clinicianDecision?.note || c.priorityNote || 'Standard clinical ingestion and quality review.'}
                  </td>
                  <td className="py-space-md px-space-md whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-on-surface-variant">
                        person
                      </span>
                      <span className="font-label-md text-label-md">
                        {c.clinicianDecision?.clinicianName || 'Demo Clinician'}
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-lg text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-primary font-data-mono-sm text-data-mono-sm font-semibold">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Recorded
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between py-space-sm gap-space-sm">
          <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
            Audit Log Storage: Append Only (Demo audit record)
          </span>
        </div>
      </div>

      {exportFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded shadow-xl flex items-center gap-space-sm font-data-mono-sm text-data-mono-sm border border-primary-fixed/30">
          <span className="material-symbols-outlined text-primary-fixed">file_download_done</span>
          <span>Audit Pack NDJSON Export Complete. Demo audit record exported.</span>
        </div>
      )}
    </div>
  );
};
