import React from 'react';
import { ASSETS } from '../constants/assets';

export type NavView =
  | 'dashboard'
  | 'new-analysis'
  | 'quality-gate'
  | 'assistance-settings'
  | 'ai-findings-review'
  | 'decision-log'
  | 'cases'
  | 'settings-safety-controls';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  pendingReviewCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  pendingReviewCount,
}) => {
  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: 'grid_view' },
    { id: 'new-analysis' as NavView, label: 'New Analysis', icon: 'add_to_photos' },
    { id: 'quality-gate' as NavView, label: 'Quality Gate', icon: 'verified_user' },
    {
      id: 'ai-findings-review' as NavView,
      label: 'AI Findings & Review',
      icon: 'biotech',
      badge: pendingReviewCount > 0 ? String(pendingReviewCount) : undefined,
    },
    { id: 'decision-log' as NavView, label: 'Decision Log', icon: 'history_edu' },
    { id: 'cases' as NavView, label: 'Cases Worklist', icon: 'folder_shared' },
    { id: 'settings-safety-controls' as NavView, label: 'Settings & Safety Controls', icon: 'shield_lock' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/30">
      <div className="flex flex-col">
        {/* Logo and Suite Header */}
        <div className="px-space-lg py-space-md flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <img
              alt="Adaptive Scan AI Logo"
              className="h-8 w-auto object-contain"
              src={ASSETS.logo}
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">
                Adaptive Scan
              </span>
              <span className="font-label-sm text-label-sm text-primary font-medium tracking-normal">
                AI Diagnostic Suite
              </span>
            </div>
          </div>
          <div className="mt-space-xs">
            <span className="inline-flex items-center px-space-sm py-0.5 rounded bg-surface-container-high text-on-surface-variant font-data-mono-sm text-data-mono-sm">
              Clinical Decision Support
            </span>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-space-md py-space-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase px-space-sm font-semibold tracking-wider">
            Workstation Core
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col px-space-md gap-0.5">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center justify-between px-space-md py-space-sm rounded transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-body-md text-body-md'
                }`}
              >
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-lg leading-none">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded font-data-mono-sm text-data-mono-sm font-semibold ${
                      isActive
                        ? 'bg-on-primary text-primary-container'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Clinician & Safety Footer */}
      <div className="flex flex-col p-space-md gap-space-sm bg-surface-container-lowest border-t border-outline-variant/20">
        <div className="p-space-sm rounded bg-surface-container-low flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-primary font-semibold">
              Quality Gate Active
            </span>
          </div>
          <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
            Human-in-the-Loop Enforced
          </span>
        </div>

        <div className="flex items-center justify-between p-space-sm rounded bg-surface-container-high">
          <div className="flex items-center gap-space-sm min-w-0">
            <img
              alt="Demo Clinician"
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-primary/30"
              src={ASSETS.doctorAvatar}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-surface truncate">
                Demo Clinician
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Clinician Review
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-space-xs">
          <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
            Clinician Mode Status
          </span>
          <span className="px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
            Active
          </span>
        </div>
      </div>
    </aside>
  );
};
