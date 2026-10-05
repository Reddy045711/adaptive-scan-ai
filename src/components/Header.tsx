import React, { useState } from 'react';
import { ASSETS } from '../constants/assets';
import { NavView } from './Sidebar';

interface HeaderProps {
  onNavigate: (view: NavView) => void;
  currentView: NavView;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView }) => {
  const [showBypassModal, setShowBypassModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getSubBreadcrumb = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Overview & Triage Queue';
      case 'new-analysis':
        return 'Volumetric Intake & Ingestion';
      case 'quality-gate':
        return 'Pre-flight Quality Gate';
      case 'assistance-settings':
        return 'Adaptive Assistance Selection';
      case 'ai-findings-review':
        return 'AI Advisory Review & Sign-off';
      case 'decision-log':
        return 'Immutable Audit Ledger';
      case 'cases':
        return 'Clinical Worklist Archive';
      case 'settings-safety-controls':
        return 'Governance & Guardrails';
      default:
        return 'Diagnostic Workstation';
    }
  };

  return (
    <>
      <header className="fixed top-0 left-72 right-0 h-16 bg-surface-container-lowest z-40 flex items-center justify-between px-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30">
        {/* Left: Breadcrumbs & Environment */}
        <div className="flex items-center gap-space-lg">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-base">local_hospital</span>
            <span
              className="hover:text-on-surface cursor-pointer"
              onClick={() => onNavigate('dashboard')}
            >
              Clinical Hub
            </span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-medium text-on-surface">{getSubBreadcrumb()}</span>
          </div>

          <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-0.5 rounded bg-surface-container-high text-on-surface font-data-mono-sm text-data-mono-sm">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>Environment: Demo Prototype (De-identified Data)</span>
          </div>
        </div>

        {/* Right: Actions, Badges & User */}
        <div className="flex items-center gap-space-md">
          {/* Protocol Badge */}
          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-low text-primary">
            <span className="material-symbols-outlined text-base text-primary font-semibold">
              check_circle
            </span>
            <span className="font-label-sm text-label-sm font-semibold">
              Adaptive Scan AI — Demo
            </span>
          </div>

          {/* Emergency Bypass Button */}
          <button
            onClick={() => setShowBypassModal(true)}
            className="flex items-center gap-1.5 px-space-sm py-1 rounded bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors font-label-md text-label-md font-semibold cursor-pointer"
            title="Emergency Medical Bypass Protocol"
          >
            <span className="material-symbols-outlined text-base">lock</span>
            <span>Emergency Bypass</span>
          </button>

          {/* Notifications Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-space-xs rounded text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-xl leading-none">
                notifications
              </span>
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-error"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 p-space-md z-50 flex flex-col gap-2">
                <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Live Telemetry Alerts
                  </span>
                  <span className="font-data-mono-sm text-data-mono-sm text-primary">2 Unresolved</span>
                </div>
                <div
                  className="p-space-sm rounded bg-error-container/30 hover:bg-error-container/50 transition-colors cursor-pointer flex flex-col gap-0.5"
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('quality-gate');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-bold text-error">
                      Gate Intercept Flagged
                    </span>
                    <span className="font-data-mono-sm text-[10px] text-on-surface-variant">
                      34m ago
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    Case #1039 failed quality check (severe motion artifacts). Inference withheld.
                  </p>
                </div>
                <div
                  className="p-space-sm rounded bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer flex flex-col gap-0.5"
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('ai-findings-review');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-semibold text-secondary">
                      Advisory Ready for Review
                    </span>
                    <span className="font-data-mono-sm text-[10px] text-on-surface-variant">
                      12m ago
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    Case #1042 inference ready for clinician review.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* New Scan Primary Action */}
          <button
            onClick={() => onNavigate('new-analysis')}
            className="flex items-center gap-space-xs px-space-md py-1.5 rounded bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary transition-colors font-label-md text-label-md font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base leading-none">add</span>
            <span>New Scan</span>
          </button>

          {/* Clinician Avatar */}
          <img
            alt="Demo Clinician"
            className="w-8 h-8 rounded-full object-cover shrink-0 ml-space-xs ring-1 ring-primary/30 cursor-pointer"
            src={ASSETS.doctorAvatar}
            onClick={() => onNavigate('settings-safety-controls')}
            title="Demo Clinician - Settings"
          />
        </div>
      </header>

      {/* Emergency Bypass Modal Dialog */}
      {showBypassModal && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-xl shadow-2xl p-space-xl flex flex-col gap-space-md border border-error/20">
            <div className="flex items-start gap-space-md">
              <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">emergency</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Emergency Clinical Override Protocol
                </h3>
                <span className="font-data-mono-sm text-data-mono-sm text-error font-semibold">
                  STAT OVERRIDE // CODE RED PROTOCOL
                </span>
              </div>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              In accordance with safety guidance, emergency bypass permits immediate direct visual read of degraded scans without automated quality gate blockage. All diagnostic responsibility transfers entirely to the attending physician.
            </p>

            <div className="bg-surface-container-low p-space-sm rounded text-on-surface font-data-mono-sm text-data-mono-sm flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Attending Clinician:</span>
                <span className="font-bold">Demo Clinician</span>
              </div>
              <div className="flex justify-between">
                <span>Workstation Token:</span>
                <span>DEMO-DX-04-AUTH</span>
              </div>
              <div className="flex justify-between">
                <span>Decision Audit:</span>
                <span className="text-primary font-semibold">Demo Audit Logging Active</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-space-sm pt-space-xs">
              <button
                onClick={() => setShowBypassModal(false)}
                className="px-space-md py-1.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBypassModal(false);
                  onNavigate('quality-gate');
                }}
                className="px-space-lg py-1.5 rounded bg-error text-on-error hover:bg-on-error-container font-label-md text-label-md font-semibold shadow-sm cursor-pointer"
              >
                Acknowledge & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
