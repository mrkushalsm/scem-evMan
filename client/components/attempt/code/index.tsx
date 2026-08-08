"use client";
import React, { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import CodeEditorPanel from "./code-editor";
import DescriptionPanel from "./description";
import TestCasePanel from "./test-case";
import { CodingProblem } from "@/types/problem";

export function CodeScreen({ problem }: { problem: CodingProblem }) {
  const availableLanguages = Object.keys(problem.boilerplateCode || {}) as Array<keyof typeof problem.boilerplateCode>;
  
  const initialLanguage = problem.savedLanguage || (availableLanguages.length > 0 ? String(availableLanguages[0]) : "javascript");
  const [language, setLanguage] = useState(initialLanguage);
  
  const [code, setCode] = useState(problem.savedCode || (problem.boilerplateCode && availableLanguages.length > 0 ? (problem.boilerplateCode[initialLanguage as keyof typeof problem.boilerplateCode] || "") : "// Start coding here"));
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // If we do not have a saved code from the server for the current initial language, check local storage
    if (!problem.savedCode) {
      try {
        const draft = localStorage.getItem(`pomelo_draft_${problem.id}_${initialLanguage}`);
        if (draft) setCode(draft);
      } catch { /* localStorage unavailable (e.g. private browsing) */ }
    }
  }, [problem.id, initialLanguage, problem.savedCode]);

  React.useEffect(() => {
    if (isMounted && code !== "") {
      try {
        localStorage.setItem(`pomelo_draft_${problem.id}_${language}`, code);
      } catch { /* localStorage unavailable */ }
    }
  }, [code, language, problem.id, isMounted]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    
    // Prioritize server-saved code if this is the language they originally submitted in
    if (problem.savedLanguage === newLang && problem.savedCode) {
      setCode(problem.savedCode);
      return;
    }

    // Try loading from local storage
    let draft: string | null = null;
    try { draft = localStorage.getItem(`pomelo_draft_${problem.id}_${newLang}`); } catch { /* unavailable */ }
    if (draft) {
      setCode(draft);
    } else {
      setCode(problem.boilerplateCode ? (problem.boilerplateCode[newLang as keyof typeof problem.boilerplateCode] || "") : "// Start coding here");
    }
  };

  if (!isMounted) return null;

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-screen h-full border"
    >
      <ResizablePanel defaultSize={30} minSize={4}>
        <div className="flex h-full w-full">
          <DescriptionPanel problem={problem} />
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70} minSize={20}>
        <ResizablePanelGroup direction="vertical" className="h-full w-full">
          <ResizablePanel defaultSize={55} minSize={6}>
            <div className="flex h-full w-full ">
              <CodeEditorPanel
                problem={problem}
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={handleLanguageChange}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={45} minSize={6}>
            <div className="flex h-full w-full">
              <TestCasePanel
                problem={problem}
                code={code}
                language={language}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
