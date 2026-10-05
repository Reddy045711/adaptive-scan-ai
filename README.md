# Adaptive Scan AI

> AI that knows when to analyze, how to explain, and when to stop.

Adaptive Scan AI is a clinician-controlled medical imaging decision-support prototype designed to provide AI-assisted MRI analysis while keeping scan quality, explainability, limitations, and clinician judgment at the center of the workflow.

## What It Does

Adaptive Scan AI follows a safety-first workflow:

MRI / Scan
→ Scan Quality Gate
→ Assistance Mode
→ AI Analysis
→ Findings & Evidence
→ Clinician Review
→ Accept / Correct / Reject
→ Decision Log

### Key Features

- Pre-inference scan quality gating
- AI inference blocking when scan quality is insufficient
- Adaptive assistance modes:
  - Focused
  - Explain
  - Review
- NVIDIA MONAI BraTS MRI segmentation integration
- Quantitative segmentation evidence
- Explainable findings and limitations
- Human-in-the-loop Accept / Correct / Reject workflow
- Demo audit record for clinician decisions
- Local case and decision storage

## NVIDIA BraTS Integration

The project uses a verified NVIDIA MONAI BraTS MRI segmentation result generated through a research/demo inference pipeline.

For the demonstration case `BraTS2021_00495`:

| Region | Volume |
|---|---:|
| Whole Tumor | 94.97 mL |
| Tumor Core | 52.18 mL |
| Enhancing Tumor | 28.47 mL |

Single-case evaluation against the provided ground truth:

| Metric | Dice |
|---|---:|
| Whole Tumor | 0.9513 |
| Tumor Core | 0.9584 |
| Enhancing Tumor | 0.8722 |

These Dice values are evaluation metrics for a single test case and are **not patient-specific confidence scores**.

## Safety

Adaptive Scan AI is a research/demo decision-support prototype and is **not a clinical diagnostic system**.

The system is designed to:

- Block AI analysis when the scan quality gate fails.
- Clearly communicate model limitations.
- Avoid presenting evaluation metrics as patient-specific confidence.
- Keep the clinician as the final decision-maker.
- Require clinician review before accepting AI suggestions.

If scan quality is insufficient, the system displays:

> Analysis withheld — scan quality is insufficient for reliable model inference. Human review is required.

## Technology

- React
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini / `@google/genai`
- NVIDIA MONAI BraTS segmentation
- NIfTI MRI data
- Local storage for demo cases and decision records

## Project Status

This is a **hackathon/research prototype** demonstrating an adaptive, safety-oriented workflow for AI-assisted medical imaging.

It has not been clinically validated and should not be used for real-world medical diagnosis or treatment decisions.

## Demo Case

The current demonstration uses a BraTS MRI case with:

- FLAIR
- T1
- T1ce
- T2
- Ground-truth segmentation

The NVIDIA segmentation result is used as verified research/demo evidence within the application.

## License

This project is intended for educational, research, and hackathon demonstration purposes.
