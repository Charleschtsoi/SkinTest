"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { warmBackend } from "@/lib/backend-warmup";
import { useAppMotion } from "@/lib/app-motion";
import { PrivacyNotice } from "@/components/upload/PrivacyNotice";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

function StepPanel({ step }: { step: 1 | 2 }) {
  switch (step) {
    case 1:
      return <PrivacyNotice />;
    case 2:
      return <ImageUploader />;
    default:
      return null;
  }
}

export function UploadFlowShell() {
  const { t } = useI18n();
  const { stepTransition } = useAppMotion();
  const step = useAppStore((s) => s.uploadFlowStep);
  const setUploadFlowStep = useAppStore((s) => s.setUploadFlowStep);
  const educationalNotDiagnosticAck = useAppStore((s) => s.educationalNotDiagnosticAck);

  const steps = [
    { n: 1 as const, label: t("upload.step1") },
    { n: 2 as const, label: t("upload.step2") },
  ];

  useEffect(() => {
    warmBackend();
  }, []);

  useEffect(() => {
    if (educationalNotDiagnosticAck && step >= 2) {
      warmBackend();
    }
  }, [educationalNotDiagnosticAck, step]);

  const canAccessStep = (target: (typeof steps)[number]["n"]): boolean => {
    if (target === 1) return true;
    return educationalNotDiagnosticAck;
  };

  return (
    <div className="flex min-h-[min(70vh,640px)] flex-col">
      <div className="flex-1 space-y-8">
        <header>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {t("upload.subtitle")}
          </h1>
        </header>

        <ol className="flex flex-wrap gap-2 border-b border-border/60 pb-4" aria-label={t("upload.title")}>
          {steps.map((s) => (
            <li key={s.n}>
              <button
                type="button"
                disabled={!canAccessStep(s.n)}
                onClick={() => setUploadFlowStep(s.n)}
                aria-current={step === s.n ? "step" : undefined}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  step === s.n
                    ? "bg-primary text-primary-foreground"
                    : step > s.n
                      ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                      : "bg-muted text-muted-foreground",
                  canAccessStep(s.n) ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                )}
              >
                {s.n}. {s.label}
              </button>
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepTransition}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <StepPanel step={step} />
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="mt-auto border-t border-transparent pt-10 text-center">
        <p className="text-xs leading-relaxed text-muted-foreground/60">
          <span className="font-medium text-muted-foreground/70">{t("upload.modeConfiguredTitle")}</span>
          {" · "}
          {t("upload.modeConfigured.api")}
        </p>
      </footer>
    </div>
  );
}
