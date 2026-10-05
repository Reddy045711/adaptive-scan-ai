import { useState, useEffect } from 'react';
import { Sidebar, NavView } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { NewScanView } from './components/NewScanView';
import { QualityGateView } from './components/QualityGateView';
import { AssistanceSelectionView } from './components/AssistanceSelectionView';
import { AIFindingsView } from './components/AIFindingsView';
import { DecisionLogView } from './components/DecisionLogView';
import { CasesListView } from './components/CasesListView';
import { SettingsView } from './components/SettingsView';
import { Case, DecisionLogEvent, AppSettings } from './types';
import {
  getStoredCases,
  saveStoredCases,
  getStoredDecisionLogs,
  getStoredSettings,
  addDecisionLogEvent,
} from './services/storageService';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLogEvent[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());

  // Load initial cases and logs from storage on mount
  useEffect(() => {
    const loadedCases = getStoredCases();
    setCases(loadedCases);
    if (loadedCases.length > 0) {
      setSelectedCase(loadedCases[0]);
    }

    const loadedLogs = getStoredDecisionLogs();
    setDecisionLogs(loadedLogs);
  }, []);

  const handleSelectCase = (caseItem: Case, targetView?: NavView) => {
    setSelectedCase(caseItem);
    if (targetView) {
      setCurrentView(targetView);
    }
  };

  const handleCaseCreated = (newCase: Case) => {
    const updatedCases = [newCase, ...cases.filter((c) => c.id !== newCase.id)];
    setCases(updatedCases);
    saveStoredCases(updatedCases);
    setSelectedCase(newCase);

    // Add upload & quality check log events
    addDecisionLogEvent({
      caseId: newCase.id,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      type: 'upload',
      title: 'Scan Uploaded',
      description: `NIfTI volume ${newCase.fileName} staged (${newCase.fileSize}, ${newCase.voxelDims}). Source: ${newCase.dataSource}.`,
      badge: 'INGESTED',
      badgeType: 'neutral',
    });

    if (newCase.qualityResult) {
      const isPassed = newCase.qualityResult.inferenceAllowed;
      addDecisionLogEvent({
        caseId: newCase.id,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        type: isPassed ? 'quality_check' : 'intercept',
        title: isPassed ? 'Quality Gate Passed' : 'Quality Gate Intercept Triggered',
        description: `Demo quality score ${newCase.qualityScore}/100 (not a clinical measurement). ${
          isPassed
            ? 'All 6 deterministic safety checks satisfied.'
            : 'Inference withheld: Artifact threshold or sequence deficit.'
        }`,
        badge: isPassed ? 'GATE: PASS' : 'GATE: BLOCKED',
        badgeType: isPassed ? 'primary' : 'error',
      });
    }

    // Refresh logs in state
    setDecisionLogs(getStoredDecisionLogs());

    // Navigate to Quality Gate review
    setCurrentView('quality-gate');
  };

  const handleUpdateCase = (updated: Case) => {
    const updatedCases = cases.map((c) => (c.id === updated.id ? updated : c));
    setCases(updatedCases);
    saveStoredCases(updatedCases);
    setSelectedCase(updated);
    setDecisionLogs(getStoredDecisionLogs());
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const pendingReviewCount = cases.filter(
    (c) => c.clinicianStatus === 'pending' && c.qualityStatus === 'ready'
  ).length;

  const activeCaseToRender = selectedCase || cases[0];

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Main Content Area Offset by Sidebar Width (72 = 18rem = 288px) */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Fixed Top Header */}
        <Header currentView={currentView} onNavigate={setCurrentView} />

        {/* Viewport Main */}
        <main className="w-full pt-16 bg-background flex-1 px-space-xl">
          {currentView === 'dashboard' && (
            <DashboardView
              cases={cases}
              onSelectCase={handleSelectCase}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'new-analysis' && (
            <NewScanView
              onCaseCreated={handleCaseCreated}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'quality-gate' && activeCaseToRender && (
            <QualityGateView
              currentCase={activeCaseToRender}
              onNavigate={setCurrentView}
              onUpdateCase={handleUpdateCase}
            />
          )}

          {currentView === 'assistance-settings' && activeCaseToRender && (
            <AssistanceSelectionView
              currentCase={activeCaseToRender}
              onNavigate={setCurrentView}
              onUpdateCase={handleUpdateCase}
            />
          )}

          {currentView === 'ai-findings-review' && activeCaseToRender && (
            <AIFindingsView
              currentCase={activeCaseToRender}
              onNavigate={setCurrentView}
              onUpdateCase={handleUpdateCase}
            />
          )}

          {currentView === 'decision-log' && (
            <DecisionLogView cases={cases} events={decisionLogs} />
          )}

          {currentView === 'cases' && (
            <CasesListView
              cases={cases}
              onSelectCase={handleSelectCase}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'settings-safety-controls' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onNavigate={setCurrentView}
            />
          )}
        </main>
      </div>
    </div>
  );
}
