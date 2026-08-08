"use client";

import { useState, useRef } from "react";
import { Upload, AlertCircle, CheckCircle2, AlertTriangle, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { importQuestions } from "@/actions/import-questions";
import { validateImportJSONClient } from "@/lib/validation";

const EXAMPLE_JSON_PLACEHOLDER = `{
  "questions": [
    {
      "type": "mcq",
      "title": "What is the time complexity of binary search?",
      "description": "...",
      "marks": 10,
      "difficulty": "Easy",
      "questionType": "Single Correct",
      "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      "correctAnswer": "O(log n)"
    },
    {
      "type": "coding",
      "title": "Two Sum",
      "description": "...",
      "marks": 30,
      "difficulty": "Easy",
      "inputFormat": "...",
      "outputFormat": "...",
      "functionName": "twoSum",
      "inputVariables": [{ "variable": "nums", "type": "int_array" }],
      "testcases": [{ "input": "...", "output": "..." }]
    }
  ]
}`;

interface ImportResult {
  valid: boolean;
  errors: Array<{ field?: string; message: string; index?: number }>;
  warnings?: string[];
  count?: number;
  preview?: Array<{ title: string; type: string; marks?: number; difficulty?: string }>;
}

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export default function BulkImportDialog({
  isOpen,
  onClose,
  onSuccess,
}: BulkImportDialogProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
      const result = validateImportJSONClient(content);
      setValidationResult(result);
    };
    reader.readAsText(file);
  };

  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);
    setValidationResult(null); // Clear validation until user submits
  };

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      setValidationResult({
        valid: false,
        errors: [{ message: "JSON input is empty" }],
      });
      return;
    }
    const result = validateImportJSONClient(jsonInput);
    setValidationResult(result);
  };

  const handleImport = async () => {
    if (!validationResult?.valid) {
      setImportStatus({
        success: false,
        message: "Cannot import: JSON has validation errors",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData to send JSON as file
      const blob = new Blob([jsonInput], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", blob, "questions.json");

      // Call server action - it handles bulk/single/mixed-type JSON imports
      // 'coding' is just a placeholder path param; server detects actual types from JSON
      const result = await importQuestions("coding", formData);

      if (!result.success) {
        throw new Error(result.message || "Import failed");
      }

      setImportStatus({
        success: true,
        message: `✓ Successfully imported ${result.imported} question(s)`,
      });

      if (onSuccess) {
        onSuccess(result.imported);
      }

      // Reset after successful import
      setTimeout(() => {
        setJsonInput("");
        setValidationResult(null);
        setImportStatus(null);
        onClose();
        // Page will auto-revalidate via server action
        window.location.reload();
      }, 1500);
    } catch (error) {
      setImportStatus({
        success: false,
        message:
          error instanceof Error ? error.message : "Import failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              <h2 className="text-xl font-bold">Bulk Import Questions</h2>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-end mb-4">
            <a href="/templates/questions_import_example.json" download>
              <Button variant="outline" size="sm" type="button" className="gap-2">
                <Download className="w-4 h-4" />
                Download Sample
              </Button>
            </a>
          </div>

          <Tabs defaultValue="paste" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">Paste JSON</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Paste your JSON here
                </label>
                <Textarea
                  value={jsonInput}
                  onChange={(e) => handleJsonInputChange(e.target.value)}
                  placeholder={EXAMPLE_JSON_PLACEHOLDER}
                  className="font-mono text-sm h-64"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Accepts bulk format: {"{ questions: [...] }"} or single question JSON. Not sure of the shape? Download the sample above.
                </p>
              </div>

              <Button
                onClick={handleValidate}
                variant="outline"
                className="w-full"
              >
                Validate JSON
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mb-4">JSON files only</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Select File
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {validationResult && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-sm">Validation Results</h3>

              {validationResult.valid ? (
                <Alert className="border-green-200 bg-green-100 dark:border-green-900/50 dark:bg-green-900/30">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    ✓ JSON is valid! Ready to import {validationResult.count} question
                    {validationResult.count !== 1 ? "s" : ""}.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-100 dark:border-red-900/50 dark:bg-red-900/30">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    Validation failed. See errors below.
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.preview && validationResult.preview.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Questions found ({validationResult.preview.length})
                  </p>
                  <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                    {validationResult.preview.map((q, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                      >
                        <span className="truncate">{q.title}</span>
                        <span className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                          <span className="rounded-full bg-muted px-2 py-0.5 uppercase tracking-wide">
                            {q.type}
                          </span>
                          {q.difficulty && <span>{q.difficulty}</span>}
                          {q.marks !== undefined && <span>{q.marks} pts</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {validationResult.errors.length > 0 && (
                <div className="bg-muted border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {validationResult.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-red-700 dark:text-red-400 flex items-start gap-2"
                    >
                      <span className="text-red-500 dark:text-red-400 mt-0.5">•</span>
                      <span>
                        {err.index !== undefined && (
                          <span className="font-mono">
                            [Question {err.index}]
                          </span>
                        )}
                        {err.field && <span className="font-mono"> {err.field}:</span>}
                        {` ${err.message}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <div className="bg-yellow-100 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-900/50 rounded-lg p-3 space-y-2">
                  {validationResult.warnings.map((warn, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-yellow-700 dark:text-yellow-400 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {importStatus && (
            <Alert
              className={
                importStatus.success
                  ? "border-green-200 bg-green-100 dark:border-green-900/50 dark:bg-green-900/30 mt-6"
                  : "border-red-200 bg-red-100 dark:border-red-900/50 dark:bg-red-900/30 mt-6"
              }
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
              <AlertDescription
                className={
                  importStatus.success
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }
              >
                {importStatus.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8 flex gap-3 justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
            <Button
              onClick={handleImport}
              disabled={!validationResult?.valid || isLoading}
              className="gap-2"
            >
              {isLoading ? "Importing..." : "Import Questions"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
