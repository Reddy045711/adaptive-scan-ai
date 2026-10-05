import React, { useState, useRef } from 'react';
import { ASSETS } from '../constants/assets';
import { Case, AssistanceMode } from '../types';
import { validateUploadedScan } from '../services/qualityService';
import { DEFAULT_AI_FINDING } from '../services/aiService';
import { REAL_NVIDIA_BRATS_RESULT } from '../services/nvidiaResultService';
import { NavView } from './Sidebar';

interface NewScanViewProps {
  onCaseCreated: (newCase: Case) => void;
  onNavigate: (view: NavView) => void;
}

export const NewScanView: React.FC<NewScanViewProps> = ({
  onCaseCreated,
  onNavigate,
}) => {
  const [caseId, setCaseId] = useState('Case #1043');
  const [scanType, setScanType] = useState('MRI Brain (Multi-sequence)');
  const [clinicalTask, setClinicalTask] = useState(
    'Ischemic stroke evaluation / space occupying lesion'
  );
  const [acquisitionProtocol, setAcquisitionProtocol] = useState(
    '3.0T MRI · Siemens Magnetom Skyra'
  );
  const [dataSource, setDataSource] = useState('PACS Archive - Neuro Suite 4');
  const [assistanceMode] = useState<AssistanceMode>('explain');

  // Active staged file state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    dimensions: string;
    snr: string;
    hash: string;
    isFailSample: boolean;
  }>({
    name: 'brain_t1_t2_flair_deidentified_vol01.nii.gz',
    size: '44.8 MB',
    dimensions: '256x256x176 voxels • Iso 1.0mm³',
    snr: '28.4 dB (Optimal)',
    hash: 'SHA-256 e3b0c442',
    isFailSample: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const isDegraded =
      file.name.toLowerCase().includes('corrupt') ||
      file.name.toLowerCase().includes('motion') ||
      file.name.toLowerCase().includes('fail') ||
      file.name.toLowerCase().includes('1039');

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

    setUploadedFile({
      name: file.name,
      size: `${sizeMb} MB`,
      dimensions: isDegraded ? '256x256x64 voxels' : '256x256x176 voxels • Iso 1.0mm³',
      snr: isDegraded ? '11.2 dB (Degraded)' : '27.9 dB (Optimal)',
      hash: `SHA-256 ${Math.random().toString(36).substring(2, 10)}`,
      isFailSample: isDegraded,
    });
  };

  const loadPresetGoodScan = () => {
    setCaseId('Case #1042');
    setScanType('MRI Brain (T1/T2 Axial)');
    setClinicalTask('Ischemic stroke evaluation / space occupying lesion');
    setUploadedFile({
      name: 'brain_t1_t2_flair_deidentified_vol01.nii.gz',
      size: '44.8 MB',
      dimensions: '256x256x176 voxels • Iso 1.0mm³',
      snr: '28.4 dB (Optimal)',
      hash: 'SHA-256 e3b0c442',
      isFailSample: false,
    });
  };

  const loadPresetDegradedScan = () => {
    setCaseId('Case #1039');
    setScanType('MRI Brain (FLAIR)');
    setClinicalTask('Acute headache / trauma protocol - motion artifact check');
    setUploadedFile({
      name: 'brain_flair_motion_degraded_vol03.nii.gz',
      size: '32.1 MB',
      dimensions: '256x256x64 voxels',
      snr: '11.2 dB (Degraded)',
      hash: 'SHA-256 b89f10a2',
      isFailSample: true,
    });
  };

  const handleProceedToQualityGate = async () => {
    setIsProcessing(true);

    const mockFile = new File(['mock content'], uploadedFile.name, {
      type: 'application/octet-stream',
    });

    const qualityResult = await validateUploadedScan(mockFile, scanType);

    const newCase: Case = {
      id: caseId,
      mrn: `MRN: ${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}X`,
      scanType,
      anatomy: 'Brain / Neuro',
      clinicalTask,
      acquisitionProtocol,
      dataSource,
      qualityStatus: qualityResult.status,
      qualityScore: qualityResult.qualityScore,
      aiStatus: qualityResult.inferenceAllowed ? 'analyzed' : 'inference_withheld',
      confidence: null, // Dice scores are evaluation metrics on BraTS dataset, not patient-specific confidence
      clinicianStatus: qualityResult.inferenceAllowed ? 'pending' : 'escalated',
      lastUpdated: 'Just now',
      createdAt: 'Today, Just now',
      assistanceMode,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      voxelDims: uploadedFile.dimensions,
      qualityResult,
      aiFinding: qualityResult.inferenceAllowed ? DEFAULT_AI_FINDING : undefined,
      nvidiaResult: qualityResult.inferenceAllowed ? REAL_NVIDIA_BRATS_RESULT : undefined,
    };

    setTimeout(() => {
      setIsProcessing(false);
      onCaseCreated(newCase);
    }, 700);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Stepper Strip */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-lg mb-space-lg border border-outline-variant/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md pb-space-md">
          <div>
            <div className="flex items-center gap-space-xs text-primary font-data-mono-sm text-data-mono-sm uppercase tracking-wider mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Clinical Intake Pipeline · Ingestion Mode
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              New Scan Analysis
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Initialize case metadata and provide imaging volumetric sequences for pre-inference
              validation.
            </p>
          </div>
          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-1.5 rounded-full">
            <span className="material-symbols-outlined text-secondary text-base">timer</span>
            <span className="font-data-mono-sm text-data-mono-sm text-on-surface font-medium">
              Session: CDS-2025-089A
            </span>
          </div>
        </div>

        {/* 6-Step Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm pt-space-md">
          {/* Step 1: Case (Completed) */}
          <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low transition-all">
            <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-data-mono-sm text-data-mono-sm font-semibold shrink-0">
              <span className="material-symbols-outlined text-base">check</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                01
              </span>
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                Case
              </span>
            </div>
          </div>

          {/* Step 2: Scan (Active / Highlighted) */}
          <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-primary-fixed text-on-primary-fixed shadow-sm transition-all ring-1 ring-primary/20">
            <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-data-mono-sm text-data-mono-sm font-semibold shrink-0">
              2
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-primary-fixed-variant uppercase tracking-wider font-semibold">
                Active
              </span>
              <span className="font-label-md text-label-md text-on-primary-fixed font-bold truncate">
                Scan
              </span>
            </div>
          </div>

          {/* Step 3: Quality (Upcoming) */}
          <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container transition-all opacity-85">
            <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-data-mono-sm text-data-mono-sm font-semibold shrink-0">
              3
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Gate
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium truncate">
                Quality
              </span>
            </div>
          </div>

          {/* Step 4: Assistance (Upcoming) */}
          <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container transition-all opacity-85">
            <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-data-mono-sm text-data-mono-sm font-semibold shrink-0">
              4
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Param
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium truncate">
                Assistance
              </span>
            </div>
          </div>

          {/* Step 5: Analysis (Upcoming) */}
          <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container transition-all opacity-85">
            <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-data-mono-sm text-data-mono-sm font-semibold shrink-0">
              5
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Model
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium truncate">
                Analysis
              </span>
            </div>
          </div>

          {/* Step 6: Review (Upcoming) */}
          <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container transition-all opacity-85">
            <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-data-mono-sm text-data-mono-sm font-semibold shrink-0">
              6
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Sign-off
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium truncate">
                Review
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HIPAA & De-identification Compliance Alert Box */}
      <div className="relative overflow-hidden w-full bg-gradient-to-r from-secondary-fixed/40 via-surface-container-low to-surface-container-lowest rounded-xl shadow-sm p-space-lg mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-outline-variant/20">
        <div className="flex items-start gap-space-md">
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-2xl">shield</span>
          </div>
          <div className="flex flex-col max-w-3xl">
            <div className="flex items-center gap-space-xs">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                HIPAA & De-identification Compliance Notice
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
                SCRUBBER READY
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
              Use de-identified data for this prototype. Avoid entering unnecessary patient
              identifiers. All DICOM tags and private metadata headers (Group 0x0010) are
              scrubbed upon ingestion (Demo intake prototype).
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-sm border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-base">verified</span>
          <span className="font-data-mono-sm text-data-mono-sm text-on-surface font-medium">
            Safe Harbor 45 CFR § 164.514
          </span>
        </div>
      </div>

      {/* Main Workstation Intake Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Case Information Form (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl shadow-sm p-space-xl flex flex-col gap-space-lg border border-outline-variant/20">
          <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-xl">folder_shared</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Case Information
              </h3>
            </div>
            <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
              ID: REQ-9942
            </span>
          </div>

          <form className="flex flex-col gap-space-md" onSubmit={(e) => e.preventDefault()}>
            {/* Case ID */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="caseId">
                  Case Identifier
                </label>
                <span className="font-data-mono-sm text-data-mono-sm text-primary font-semibold">
                  Editable
                </span>
              </div>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-lowest text-on-surface font-data-mono-md text-data-mono-md rounded-lg py-2.5 px-space-md shadow-sm outline-none border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  id="caseId"
                  type="text"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-base pointer-events-none">
                  fingerprint
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                System-assigned clinical requisition key for this workstation session.
              </span>
            </div>

            {/* Scan Type Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="scanType">
                Scan Type / Anatomy
              </label>
              <div className="relative">
                <select
                  className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg py-2.5 px-space-md shadow-sm outline-none border border-outline-variant/40 focus:border-primary appearance-none cursor-pointer transition-all pr-10"
                  id="scanType"
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                >
                  <option value="MRI Brain (Multi-sequence)">MRI Brain (Multi-sequence)</option>
                  <option value="MRI Brain (FLAIR)">MRI Brain (FLAIR)</option>
                  <option value="CT Chest (High Resolution)">CT Chest (High Resolution)</option>
                  <option value="MRI Spine (Sagittal T2)">MRI Spine (Sagittal T2)</option>
                  <option value="CT Abdomen / Pelvis">CT Abdomen / Pelvis</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-base pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Clinical Task / Target Condition */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-label-md text-label-md text-on-surface font-medium"
                htmlFor="clinicalTask"
              >
                Clinical Task / Target Condition
              </label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg py-2.5 px-space-md shadow-sm outline-none border border-outline-variant/40 focus:border-primary transition-all"
                  id="clinicalTask"
                  type="text"
                  value={clinicalTask}
                  onChange={(e) => setClinicalTask(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-base pointer-events-none">
                  clinical_notes
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <button
                  type="button"
                  className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface font-data-mono-sm text-data-mono-sm transition-colors cursor-pointer"
                  onClick={() => setClinicalTask('Acute Infarct / Perfusion Mismatch')}
                >
                  + Infarct / Perfusion
                </button>
                <button
                  type="button"
                  className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface font-data-mono-sm text-data-mono-sm transition-colors cursor-pointer"
                  onClick={() => setClinicalTask('Mass Effect & Midline Shift Quantification')}
                >
                  + Mass Effect
                </button>
                <button
                  type="button"
                  className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface font-data-mono-sm text-data-mono-sm transition-colors cursor-pointer"
                  onClick={() => setClinicalTask('Motion Artifact Pre-clearance Audit')}
                >
                  + Motion Check
                </button>
              </div>
            </div>

            {/* Acquisition Date & Modality Protocol */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-label-md text-label-md text-on-surface font-medium"
                htmlFor="acquisitionProtocol"
              >
                Acquisition Date & Modality Protocol
              </label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-lowest text-on-surface font-data-mono-md text-data-mono-md rounded-lg py-2.5 px-space-md shadow-sm outline-none border border-outline-variant/40 focus:border-primary transition-all"
                  id="acquisitionProtocol"
                  type="text"
                  value={acquisitionProtocol}
                  onChange={(e) => setAcquisitionProtocol(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-base pointer-events-none">
                  radiology
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-data-mono-sm text-data-mono-sm px-1">
                <span>Acquired: Today 09:14 EST</span>
                <span>Slice Res: 0.9 x 0.9 mm</span>
              </div>
            </div>

            {/* Data Source */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="dataSource">
                Ingestion Pipeline Source
              </label>
              <div className="relative">
                <select
                  className="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg py-2.5 px-space-md shadow-sm outline-none border border-outline-variant/40 focus:border-primary appearance-none cursor-pointer transition-all pr-10"
                  id="dataSource"
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value)}
                >
                  <option value="PACS Archive - Neuro Suite 4">PACS Archive - Neuro Suite 4</option>
                  <option value="External DICOM Direct Upload">External DICOM Direct Upload</option>
                  <option value="Emergency Trauma Feed (Fast-Track)">
                    Emergency Trauma Feed (Fast-Track)
                  </option>
                  <option value="Enterprise VNA (Vendor Neutral Archive)">
                    Enterprise VNA (Vendor Neutral Archive)
                  </option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-base pointer-events-none">
                  dns
                </span>
              </div>
            </div>

            {/* Supplementary Ingestion Flags */}
            <div className="bg-surface-container-low p-space-md rounded-lg mt-space-xs flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-base">neurology</span>
                  <span className="font-body-md text-body-md text-on-surface font-medium">
                    Volumetric Multi-echo Fusion
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-data-mono-sm text-data-mono-sm font-semibold">
                  Enabled
                </span>
              </div>
              <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                Includes FLAIR, T1w contrast-enhanced, and DWI ADC trace sequences.
              </span>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Scan Upload & Ingestion Area (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Primary Ingestion Canvas / Drag & Drop */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl flex flex-col gap-space-lg border border-outline-variant/20">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-xl">cloud_upload</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Scan Upload & Volumetric Ingestion
                </h3>
              </div>
              <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">
                Voxel Engine 2.1
              </span>
            </div>

            {/* Quick Demo Scan Loader Presets */}
            <div className="flex flex-col sm:flex-row items-center gap-2 p-space-sm rounded-lg bg-surface-container-low">
              <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">
                Quick Test Datasets:
              </span>
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <button
                  type="button"
                  onClick={loadPresetGoodScan}
                  className="px- space-sm py-1 rounded bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim font-data-mono-sm text-data-mono-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Good Scan: Case #1042 (Pass)</span>
                </button>
                <button
                  type="button"
                  onClick={loadPresetDegradedScan}
                  className="px-space-sm py-1 rounded bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-data-mono-sm text-data-mono-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span>Degraded Scan: Case #1039 (Fail)</span>
                </button>
              </div>
            </div>

            {/* Dashed Drag-and-Drop Dropzone */}
            <div
              className={`group relative overflow-hidden transition-all rounded-xl p-space-xl flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed ${
                isDragOver
                  ? 'border-primary bg-primary-fixed/20'
                  : 'border-outline-variant/60 bg-surface-container-low hover:bg-surface-container/70'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".nii,.nii.gz,.zip,.dcm"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest text-primary shadow-sm flex items-center justify-center mb-space-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">view_in_ar</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
                Upload Medical Scan (.nii / .nii.gz / DICOM zip)
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-space-lg">
                Drag and drop multi-slice DICOM series or 3D NIfTI volumes directly into this safe
                ingestion viewport.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-space-md">
                <button
                  className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold shadow-sm transition-all cursor-pointer border border-outline-variant/30"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">folder_open</span>
                  <span>Browse Local PACS / Files</span>
                </button>
                <span className="font-data-mono-sm text-data-mono-sm text-on-surface-variant">
                  or import via DICOM Web / C-STORE
                </span>
              </div>
              <div className="mt-space-lg pt-space-md flex items-center gap-space-lg text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>ISO 12052 (DICOM)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>NIfTI-1 / NIfTI-2
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Lossless LZ4 Scrubber
                </span>
              </div>
            </div>

            {/* Uploaded File Preview Card (Ready Active State) */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Active Volumetric Sequence Ready
                </span>
                <span className="font-data-mono-sm text-data-mono-sm text-primary font-semibold">
                  Hash Verified: {uploadedFile.hash}
                </span>
              </div>
              <div
                className={`rounded-xl p-space-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md transition-all border ${
                  uploadedFile.isFailSample
                    ? 'bg-error-container/20 border-error/30'
                    : 'bg-surface-container-low border-outline-variant/20'
                }`}
              >
                <div className="flex items-center gap-space-md min-w-0">
                  {/* Visual Scan Thumbnail */}
                  <div className="relative w-14 h-14 rounded-lg bg-inverse-surface overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                    <img
                      alt="Slice Preview"
                      className="w-full h-full object-cover opacity-85"
                      src={uploadedFile.isFailSample ? ASSETS.scanCorrupted1039 : ASSETS.scanThumb}
                    />
                    <span
                      className={`absolute bottom-0 right-0 px-1 py-0.5 text-[9px] rounded-tl font-bold ${
                        uploadedFile.isFailSample
                          ? 'bg-error text-on-error'
                          : 'bg-primary text-on-primary'
                      }`}
                    >
                      3D
                    </span>
                  </div>
                  {/* Metadata Details */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-space-xs truncate">
                      <span className="font-data-mono-md text-data-mono-md text-on-surface font-semibold truncate">
                        {uploadedFile.name}
                      </span>
                      <span
                        className={`material-symbols-outlined text-base shrink-0 ${
                          uploadedFile.isFailSample ? 'text-error' : 'text-primary'
                        }`}
                      >
                        {uploadedFile.isFailSample ? 'warning' : 'check_circle'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-space-xs font-data-mono-sm text-data-mono-sm text-on-surface-variant mt-0.5">
                      <span className="font-semibold text-on-surface">{uploadedFile.size}</span>
                      <span>•</span>
                      <span>NIfTI 3D Volume</span>
                      <span>•</span>
                      <span>{uploadedFile.dimensions}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          uploadedFile.isFailSample ? 'bg-error' : 'bg-primary'
                        }`}
                      ></span>
                      <span
                        className={`font-label-sm text-label-sm font-semibold ${
                          uploadedFile.isFailSample ? 'text-error' : 'text-primary'
                        }`}
                      >
                        {uploadedFile.isFailSample
                          ? 'Ingested · High Artifact Risk Flagged'
                          : 'Upload Complete · Integrity Check Passed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Controls on Ingested File */}
                <div className="flex items-center gap-space-xs shrink-0 self-end md:self-center">
                  <button
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                    title="Inspect Header Metadata"
                    type="button"
                    onClick={() =>
                      alert(
                        `NIfTI Header Dump:\nMatrix: ${uploadedFile.dimensions}\nSNR: ${uploadedFile.snr}\nHash: ${uploadedFile.hash}`
                      )
                    }
                  >
                    <span className="material-symbols-outlined text-lg">data_object</span>
                  </button>
                  <button
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                    title="Preview Orthogonal Slices"
                    type="button"
                    onClick={handleProceedToQualityGate}
                  >
                    <span className="material-symbols-outlined text-lg">view_stream</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Metric Histogram Visualization */}
            <div className="bg-surface-container-low/60 rounded-xl p-space-md flex flex-col gap-space-xs border border-outline-variant/20">
              <div className="flex items-center justify-between text-on-surface-variant font-data-mono-sm text-data-mono-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">equalizer</span>
                  Voxel Intensity Distribution (Normalized Signal-to-Noise Preview)
                </span>
                <span
                  className={`font-semibold ${
                    uploadedFile.isFailSample ? 'text-error' : 'text-primary'
                  }`}
                >
                  SNR: {uploadedFile.snr}
                </span>
              </div>
              <div className="w-full h-12 flex items-end">
                <svg
                  className={`w-full h-10 overflow-visible ${
                    uploadedFile.isFailSample ? 'text-error' : 'text-primary'
                  }`}
                  preserveAspectRatio="none"
                  viewBox="0 0 400 40"
                >
                  <path
                    d={
                      uploadedFile.isFailSample
                        ? 'M0,38 Q30,20 60,30 T120,10 T160,35 T190,12 T220,38 T260,15 T300,30 T360,18 T400,38 L400,40 L0,40 Z'
                        : 'M0,38 Q40,38 70,36 T120,30 T160,18 T190,4 T210,12 T250,22 T290,32 T340,36 T400,38 L400,40 L0,40 Z'
                    }
                    fill="currentColor"
                    fillOpacity="0.15"
                  ></path>
                  <path
                    d={
                      uploadedFile.isFailSample
                        ? 'M0,38 Q30,20 60,30 T120,10 T160,35 T190,12 T220,38 T260,15 T300,30 T360,18 T400,38'
                        : 'M0,38 Q40,38 70,36 T120,30 T160,18 T190,4 T210,12 T250,22 T290,32 T340,36 T400,38'
                    }
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  ></path>
                  <line
                    stroke={uploadedFile.isFailSample ? '#ba1a1a' : '#006399'}
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                    x1="190"
                    x2="190"
                    y1="4"
                    y2="40"
                  ></line>
                  <circle
                    cx="190"
                    cy="4"
                    fill={uploadedFile.isFailSample ? '#ba1a1a' : '#006399'}
                    r="3"
                  ></circle>
                </svg>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-data-mono-sm text-[10px]">
                <span>0 HU (Background Air)</span>
                <span className="text-secondary font-semibold">
                  {uploadedFile.isFailSample ? 'Mean Peak: 84.0 (Degraded)' : 'Mean Peak: 142.1'}
                </span>
                <span>+2500 HU (Bone/Hyperdense)</span>
              </div>
            </div>

            {/* Critical Safety Warning Note */}
            <div className="bg-surface-container-high/80 rounded-xl p-space-lg flex items-start gap-space-md shadow-sm border border-outline-variant/30">
              <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-xl text-primary font-semibold">
                  shield_locked
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Quality Gate Enforcement Policy
                </span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
                  The scan will be checked for quality before AI inference is allowed. If
                  signal-to-noise or motion artifacts fail validation thresholds, inference will be
                  intentionally withheld.
                </p>
                <div className="mt-2 flex items-center gap-space-sm text-primary font-data-mono-sm text-data-mono-sm">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span>FDA SaMD Class II Quality Assurance Enforced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="sticky bottom-4 z-30 mt-space-xl bg-surface-container-lowest/95 backdrop-blur-md rounded-xl shadow-lg p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md border border-outline-variant/30">
        <div className="flex items-center gap-space-md w-full sm:w-auto">
          <div className="flex items-center gap-space-xs font-data-mono-sm text-data-mono-sm text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Requisition: {caseId}</span>
          </div>
          <span className="text-outline-variant hidden sm:inline">•</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">
            1 Volumetric Sequence Staged
          </span>
        </div>
        <div className="flex items-center gap-space-md w-full sm:w-auto justify-end">
          <button
            className="flex-1 sm:flex-none flex items-center justify-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-all cursor-pointer"
            type="button"
            onClick={() => onNavigate('dashboard')}
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Save Draft & Return</span>
          </button>
          <button
            className="flex-1 sm:flex-none flex items-center justify-center gap-space-xs px-space-xl py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75"
            type="button"
            disabled={isProcessing}
            onClick={handleProceedToQualityGate}
          >
            {isProcessing ? (
              <>
                <span className="inline-block w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin mr-1.5"></span>
                <span>Initializing Quality Gate Pipeline...</span>
              </>
            ) : (
              <>
                <span>Proceed to Quality Gate Check</span>
                <span className="material-symbols-outlined text-lg leading-none">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
