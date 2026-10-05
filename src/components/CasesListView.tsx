import React, { useState } from 'react';
import { Case } from '../types';
import { NavView } from './Sidebar';

interface CasesListViewProps {
  cases: Case[];
  onSelectCase: (caseItem: Case, targetView?: NavView) => void;
  onNavigate: (view: NavView) => void;
}

export const CasesListView: React.FC<CasesListViewProps> = ({
  cases,
  onSelectCase,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<Case | null>(null);

  const filtered = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const match =
      c.id.toLowerCase().includes(q) ||
      c.mrn.toLowerCase().includes(q) ||
      c.scanType.toLowerCase().includes(q) ||
      c.clinicalTask.toLowerCase().includes(q);

    if (!match) return false;

    if (filterStatus === 'pending') return c.clinicianStatus === 'pending';
    if (filterStatus === 'accepted') return c.clinicianStatus === 'accepted';
    if (filterStatus === 'issues') return c.qualityStatus === 'review_required';
    return true;
  });

  return (
    <div className="py-space-xl flex flex-col gap-space-lg w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs text-primary font-data-mono-sm text-data-mono-sm uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            Workstation Archive
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            Case Management Worklist
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Inspect case history, pre-inference quality diagnostics, and recorded clinician determinations.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new-analysis')}
          className="flex items-center gap-space-xs bg-primary text-on-primary hover:bg-primary-container px-space-lg py-space-sm rounded-lg font-label-md text-label-md font-semibold transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>New Scan Intake</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md border border-outline-variant/20">
        <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-lg w-full md:w-auto">
          {[
            { id: 'all', label: `All Studies (${cases.length})` },
            { id: 'pending', label: 'Awaiting Review' },
            { id: 'accepted', label: 'Ratified' },
            { id: 'issues', label: 'Quality Intercepts' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-space-md py-1 rounded font-label-sm text-label-sm cursor-pointer transition-colors ${
                filterStatus === f.id
                  ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Search Case ID, anatomy, MRN..."
            className="w-full pl-9 pr-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm outline-none border border-outline-variant/30 focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Worklist Table */}
      <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20">
        <table className="w-full text-left text-on-surface border-collapse">
          <thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            <tr>
              <th className="py-space-md px-space-lg">Case ID & MRN</th>
              <th className="py-space-md px-space-md">Scan Type & Task</th>
              <th className="py-space-md px-space-md">Quality Status</th>
              <th className="py-space-md px-space-md">AI Status</th>
              <th className="py-space-md px-space-md text-right">Confidence</th>
              <th className="py-space-md px-space-md">Clinician Status</th>
              <th className="py-space-md px-space-md">Last Updated</th>
              <th className="py-space-md px-space-lg text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-0 text-body-sm font-body-sm">
            {filtered.map((c) => {
              const isBlocked = c.qualityStatus === 'review_required';
              return (
                <tr
                  key={c.id}
                  className={`hover:bg-surface-container-low/60 transition-colors cursor-pointer ${
                    isBlocked ? 'bg-error-container/10' : ''
                  }`}
                  onClick={() => setSelectedCaseDetail(c)}
                >
                  <td className="py-space-md px-space-lg">
                    <div className="flex flex-col">
                      <span
                        className={`font-data-mono-md text-data-mono-md font-bold ${
                          isBlocked ? 'text-error' : 'text-primary'
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
                    <div className="flex flex-col max-w-xs">
                      <span className="font-medium text-on-surface">{c.scanType}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        {c.clinicalTask}
                      </span>
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

                  <td className="py-space-md px-space-md text-right font-data-mono-md text-data-mono-md font-semibold text-primary">
                    {c.confidence ? `${c.confidence}%` : '—'}
                  </td>

                  <td className="py-space-md px-space-md capitalize font-medium">
                    {c.clinicianStatus}
                  </td>

                  <td className="py-space-md px-space-md font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                    {c.lastUpdated}
                  </td>

                  <td className="py-space-md px-space-lg text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        if (isBlocked) {
                          onSelectCase(c, 'quality-gate');
                        } else {
                          onSelectCase(c, 'ai-findings-review');
                        }
                      }}
                      className="px-space-md py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-label-sm text-label-sm font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Case Details Drawer / Modal */}
      {selectedCaseDetail && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-2xl w-full rounded-xl shadow-2xl p-space-xl flex flex-col gap-space-lg border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <span className="w-2.5 h-6 bg-primary rounded"></span>
                <div className="flex flex-col">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {selectedCaseDetail.id} Comprehensive File Record
                  </h3>
                  <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                    {selectedCaseDetail.mrn} · {selectedCaseDetail.scanType}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCaseDetail(null)}
                className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-space-sm">
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Clinical Task / Indication
                </span>
                <span className="font-body-md text-body-md text-on-surface font-medium">
                  {selectedCaseDetail.clinicalTask}
                </span>
              </div>
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Acquisition Protocol
                </span>
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface">
                  {selectedCaseDetail.acquisitionProtocol}
                </span>
              </div>
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Quality Gate Status
                </span>
                <span className="font-data-mono-md text-data-mono-md font-bold text-primary">
                  {selectedCaseDetail.qualityStatus === 'ready' ? 'Ready (Checks Passed)' : 'Review Required (Inference Blocked)'}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">Demo quality score: {selectedCaseDetail.qualityScore}/100 — not a clinical measurement</span>
              </div>
              <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Assistance Mode
                </span>
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface capitalize">
                  {selectedCaseDetail.assistanceMode} Mode
                </span>
              </div>
            </div>

            {selectedCaseDetail.clinicianDecision && (
              <div className="p-space-md rounded bg-surface-container flex flex-col gap-1 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Clinician Review Recorded
                  </span>
                  <span className="font-data-mono-sm text-data-mono-sm text-primary font-bold">
                    RECORDED
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface italic">
                  "{selectedCaseDetail.clinicianDecision.note}"
                </p>
                <div className="flex items-center justify-between text-on-surface-variant font-data-mono-sm text-[10px] pt-1">
                  <span>Clinician: {selectedCaseDetail.clinicianDecision.clinicianName}</span>
                  <span>Demo audit record</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant/20">
              <button
                onClick={() => setSelectedCaseDetail(null)}
                className="px-space-md py-1.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = selectedCaseDetail;
                  setSelectedCaseDetail(null);
                  if (target.qualityStatus === 'review_required') {
                    onSelectCase(target, 'quality-gate');
                  } else {
                    onSelectCase(target, 'ai-findings-review');
                  }
                }}
                className="px-space-lg py-1.5 rounded bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold shadow-xs"
              >
                Open Full Workstation Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
