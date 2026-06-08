"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ClassName = "Melanoma" | "Basal Cell Carcinoma" | "Benign Nevus";

type PredictResponse = {
  success: boolean;
  prediction?: {
    class_id: number;
    class_name: ClassName;
    confidence_score: number;
    all_probabilities: Record<ClassName, number>;
  };
  error?: string;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function diagnosisTone(className: string): string {
  if (className === "Benign Nevus") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (className === "Basal Cell Carcinoma") return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
}

function barTone(className: string): string {
  if (className === "Benign Nevus") return "bg-emerald-500";
  if (className === "Basal Cell Carcinoma") return "bg-amber-500";
  return "bg-rose-500";
}

export function DenseNetPredictorCard({ endpoint = "/predict" }: { endpoint?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse["prediction"] | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const onFileChange = (pickedFile: File | null) => {
    setError(null);
    setResult(null);
    if (!pickedFile) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(pickedFile.type)) {
      setError("Please upload a JPEG or PNG image.");
      setFile(null);
      return;
    }
    setFile(pickedFile);
  };

  const analyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body: form });
      const data = (await res.json()) as PredictResponse;
      if (!data.success || !data.prediction) {
        setError(data.error ?? "Analysis failed.");
        return;
      }
      setResult(data.prediction);
    } catch {
      setError("Network error during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DenseNet skin lesion predictor (dev)</CardTitle>
        <CardDescription>
          Upload a skin photo to test the DenseNet classifier endpoint directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
          <UploadCloud className="h-8 w-8 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium">Choose JPEG or PNG</span>
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>

        {previewUrl && (
          <div className="relative aspect-square max-h-64 w-full overflow-hidden rounded-lg border">
            <Image src={previewUrl} alt="Preview" fill className="object-contain" unoptimized />
          </div>
        )}

        <Button type="button" onClick={analyze} disabled={!file || isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Analyzing…
            </>
          ) : (
            "Run prediction"
          )}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="space-y-3">
            <p
              className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${diagnosisTone(result.class_name)}`}
            >
              {result.class_name} — {percent(result.confidence_score)}
            </p>
            <div className="space-y-2">
              {(Object.entries(result.all_probabilities) as [ClassName, number][]).map(([name, prob]) => (
                <div key={name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{name}</span>
                    <span>{percent(prob)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${barTone(name)}`} style={{ width: `${prob * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
