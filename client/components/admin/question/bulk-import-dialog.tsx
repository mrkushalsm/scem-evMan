"use client";

import { useState, useRef } from "react";
import { Upload, AlertCircle, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { importQuestions } from "@/app/actions/import-questions";
import { validateImportJSONClient } from "@/lib/validation";

interface ImportResult {
  valid: boolean;
  errors: Array<{ field?: string; message: string; index?: number }>;
  warnings?: string[];
  count?: number;
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

      // Call server action - it handles both JSON and CSV, and mixed types
      // Use 'coding' as default type; server detects actual types from JSON
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
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
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
                  placeholder='{"questions": [...]}'
                  className="font-mono text-sm h-64"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Accepts bulk format: {"{ questions: [...] }"} or single question JSON
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
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mb-4">JSON files only</p>
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
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✓ JSON is valid! Ready to import {validationResult.count} question
                    {validationResult.count !== 1 ? "s" : ""}.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Validation failed. See errors below.
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.errors.length > 0 && (
                <div className="bg-gray-50 border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {validationResult.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-red-700 flex items-start gap-2"
                    >
                      <span className="text-red-500 mt-0.5">•</span>
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                  {validationResult.warnings.map((warn, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-yellow-700 flex items-start gap-2"
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
                  ? "border-green-200 bg-green-50 mt-6"
                  : "border-red-200 bg-red-50 mt-6"
              }
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  importStatus.success ? "text-green-800" : "text-red-800"
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
