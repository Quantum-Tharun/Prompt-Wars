"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSkillPath, type QuestionClientItem } from "@/lib/store/skillpath-store";
import { StageFrame } from "@/components/shell/StageFrame";
import { apiClient } from "@/lib/api/client";
import { formatCognitiveTier } from "@/lib/format";

export function VerifyStage() {
  const { state, dispatch } = useSkillPath();
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState<string>("python");
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(performance.now());
  const [elapsedTimer, setElapsedTimer] = useState<number>(0);

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTimer(Math.round((performance.now() - startTime) / 1000));
    }, 200);
    return () => clearInterval(interval);
  }, [startTime]);

  // Load questions if not yet loaded
  useEffect(() => {
    async function loadQuestions() {
      if (Object.keys(state.assessmentQuestionsBySkill).length > 0) {
        setQuestionsLoaded(true);
        return;
      }

      dispatch({ type: "START_LOADING", message: "Synthesizing 3-Question Adaptive Staircase..." });
      try {
        const res = await apiClient.getAssessmentQuestions(
          state.claims,
          state.background.targetCareerId
        );
        dispatch({
          type: "SET_ASSESSMENT_QUESTIONS",
          questionsBySkill: res.questionsBySkill as any,
          allQuestions: res.allQuestions as any,
        });
        const firstSkill = Object.keys(res.questionsBySkill)[0] || "python";
        setActiveSkillId(firstSkill);
        setQuestionsLoaded(true);
        setStartTime(performance.now());
        dispatch({ type: "STOP_LOADING" });
      } catch (err: any) {
        dispatch({ type: "STOP_LOADING" });
        alert(`Failed to load questions: ${err.message}`);
      }
    }
    loadQuestions();
  }, [state.claims, state.background.targetCareerId, dispatch, state.assessmentQuestionsBySkill]);

  const skillsList = Object.keys(state.assessmentQuestionsBySkill);
  const currentSkillQuestions = state.assessmentQuestionsBySkill[activeSkillId] || [];
  const currentQuestion: QuestionClientItem | undefined = currentSkillQuestions[activeQuestionIdx];

  const currentSkillIndex = skillsList.indexOf(activeSkillId);

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNextQuestion = async () => {
    if (selectedOption === null || !currentQuestion) return;

    const timeSpentMs = Math.round(performance.now() - startTime);

    dispatch({
      type: "RECORD_ANSWER",
      questionId: currentQuestion.id,
      selectedIndex: selectedOption,
      timeSpentMs,
    });

    setSelectedOption(null);
    setStartTime(performance.now());

    // Check if more questions in current skill
    if (activeQuestionIdx + 1 < currentSkillQuestions.length) {
      setActiveQuestionIdx(activeQuestionIdx + 1);
      return;
    }

    // Check if more skills
    if (currentSkillIndex + 1 < skillsList.length) {
      const nextSkill = skillsList[currentSkillIndex + 1];
      setActiveSkillId(nextSkill);
      setActiveQuestionIdx(0);
      return;
    }

    // All questions finished -> submit to orchestrator
    await submitAssessment();
  };

  const submitAssessment = async () => {
    dispatch({
      type: "START_LOADING",
      message: "Scoring cognitive tiers, computing calibration, and synthesizing 5-phase roadmap...",
    });

    try {
      const answersToSubmit = [
        ...state.userAnswers,
        ...(selectedOption !== null && currentQuestion
          ? [
              {
                questionId: currentQuestion.id,
                selectedIndex: selectedOption,
                timeSpentMs: Math.round(performance.now() - startTime),
              },
            ]
          : []),
      ];

      const platformSignals = {
        python: { repoCount: 4, certCount: 0, evidenceSource: "GitHub: 4 Python repositories" },
        sql: { repoCount: 0, certCount: 2, evidenceSource: "LinkedIn: 2 Course certificates" },
        html: { repoCount: 0, certCount: 0, evidenceSource: "Self-study practice code" },
      };

      const res = await apiClient.orchestratePipeline(
        state.background,
        state.claims,
        answersToSubmit,
        platformSignals
      );

      dispatch({ type: "SET_ORCHESTRATION_DATA", payload: res });
      dispatch({ type: "STOP_LOADING" });
      dispatch({ type: "SET_ACTIVE_STAGE", stage: 4 });
    } catch (err: any) {
      dispatch({ type: "STOP_LOADING" });
      alert(`Orchestration error: ${err.message}`);
    }
  };

  // Presenter shortcut: Fill Alex Chen demo answers
  const handleFillDemoAnswers = async () => {
    dispatch({
      type: "START_LOADING",
      message: "Injecting Alex Chen benchmark answers (Python 86%, SQL 50% with latency flag, HTML 86%)...",
    });

    // Python answers: py_q2 (opt_b), py_q3 (opt_a), py_q5 (opt_b)
    // SQL answers: sql_q1 (opt_a), sql_q2 (opt_a, 2500ms rapid guess), sql_q3 (opt_a)
    // HTML answers: html_q1 (opt_b), html_q2 (opt_b), html_q3 (opt_a)
    const demoAnswers = [
      { questionId: "py_q2", selectedIndex: 1, timeSpentMs: 14000 },
      { questionId: "py_q3", selectedIndex: 0, timeSpentMs: 18000 },
      { questionId: "py_q5", selectedIndex: 1, timeSpentMs: 12000 },
      { questionId: "sql_q1", selectedIndex: 0, timeSpentMs: 8000 },
      { questionId: "sql_q2", selectedIndex: 0, timeSpentMs: 2500 }, // <4s triggers anomaly
      { questionId: "sql_q3", selectedIndex: 0, timeSpentMs: 3200 },
      { questionId: "html_q1", selectedIndex: 1, timeSpentMs: 9000 },
      { questionId: "html_q2", selectedIndex: 1, timeSpentMs: 11000 },
      { questionId: "html_q3", selectedIndex: 0, timeSpentMs: 10000 },
    ];

    try {
      const platformSignals = {
        python: { repoCount: 4, certCount: 0, evidenceSource: "GitHub: 4 Python repositories" },
        sql: { repoCount: 0, certCount: 2, evidenceSource: "LinkedIn: 2 Course certificates" },
        html: { repoCount: 0, certCount: 0, evidenceSource: "Self-study practice code" },
      };

      const res = await apiClient.orchestratePipeline(
        state.background,
        state.claims,
        demoAnswers,
        platformSignals
      );

      dispatch({ type: "SET_ORCHESTRATION_DATA", payload: res });
      dispatch({ type: "STOP_LOADING" });
      dispatch({ type: "SET_ACTIVE_STAGE", stage: 4 });
    } catch (err: any) {
      dispatch({ type: "STOP_LOADING" });
      alert(`Demo orchestration error: ${err.message}`);
    }
  };

  if (!questionsLoaded || !currentQuestion) {
    return (
      <StageFrame
        stageNumber={3}
        title="Adaptive Staircase Diagnostic"
        subtitle="Synthesizing multi-tier diagnostic question bank..."
      >
        <div className="p-8 text-center text-[var(--pencil)]">
          Synthesizing calibrated diagnostic staircase...
        </div>
      </StageFrame>
    );
  }

  // Tier Glyphs: Declarative = Circle, Code tracing = Diamond, Scenario debugging = Square
  const renderTierGlyph = (tier: string) => {
    switch (tier) {
      case "syntax_recall":
      case "declarative_concept":
        return <div className="w-2.5 h-2.5 rounded-[50%] bg-[var(--ink)]" title="Declarative Concept" />;
      case "code_tracing":
        return <div className="w-2.5 h-2.5 rotate-45 bg-[var(--ink)]" title="Code Tracing" />;
      case "scenario_debugging":
        return <div className="w-2.5 h-2.5 bg-[var(--ink)]" title="Scenario Debugging" />;
      default:
        return null;
    }
  };

  return (
    <StageFrame
      stageNumber={3}
      title="Adaptive 3-Step Staircase Assessment"
      subtitle="Dynamic diagnostic traversal evaluating conceptual recall, execution tracing, and debugging scenarios."
    >
      <div className="space-y-6">
        {/* Progress & Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--rule)] text-[12px]">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[var(--ink)] uppercase tracking-wider">
              Skill {currentSkillIndex + 1} of {skillsList.length}: {activeSkillId}
            </span>
            <span className="text-[var(--pencil)]">·</span>
            <span className="text-[var(--pencil)]">
              Question {activeQuestionIdx + 1} of {currentSkillQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium text-[var(--ink)]">
              {renderTierGlyph(currentQuestion.cognitiveTier)}
              <span>{formatCognitiveTier(currentQuestion.cognitiveTier)}</span>
            </div>

            <div className="font-mono text-[var(--pencil)] tabular-nums">
              Timer: {elapsedTimer}s
            </div>

            <button
              onClick={handleFillDemoAnswers}
              className="text-[11px] px-2 py-1 bg-[var(--surface-recessed)] text-[var(--ink)] border border-[var(--rule)] hover:bg-[var(--paper)] rounded-[2px] cursor-pointer"
              title="Presenter Tooling: Fast-forward with Alex Chen's benchmark results"
            >
              Fill demo answers (Presenter tool)
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="border border-[var(--rule)] bg-[var(--surface)] p-5 space-y-4">
          <div className="text-[15px] font-semibold text-[var(--ink)] font-serif-reading leading-relaxed">
            {currentQuestion.prompt}
          </div>

          {/* Syntax Highlighted Code Snippet */}
          {currentQuestion.codeSnippet && (
            <div className="border border-[var(--rule)] bg-[#18191B] text-[#F7F8F7] p-3 text-[12px] font-mono overflow-x-auto rounded-[0px]">
              <pre className="leading-relaxed">
                {currentQuestion.codeSnippet.split("\n").map((line, lIdx) => (
                  <div key={lIdx} className="flex">
                    <span className="w-8 select-none text-[#5F6563] text-right pr-3">
                      {lIdx + 1}
                    </span>
                    <span>{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-2 pt-2">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = selectedOption === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-3.5 border rounded-[4px] min-h-[44px] flex items-center gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? "border-[2px] border-[var(--viridian)] bg-[var(--viridian-tint)] text-[var(--ink)] font-medium"
                      : "border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--surface-recessed)]"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-[50%] border flex items-center justify-center text-[11px] font-mono shrink-0 ${
                      isSelected
                        ? "border-[var(--viridian)] bg-[var(--viridian)] text-white font-bold"
                        : "border-[var(--pencil)] text-[var(--pencil)]"
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="text-[13px] font-serif-reading leading-snug">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
            className="px-5 py-2.5 bg-[var(--viridian)] text-[var(--surface)] hover:bg-[#187556] rounded-[4px] text-[13px] font-medium cursor-pointer disabled:opacity-40"
          >
            {activeQuestionIdx + 1 === currentSkillQuestions.length &&
            currentSkillIndex + 1 === skillsList.length
              ? "Submit diagnostic assessment"
              : "Next question"}
          </button>
        </div>
      </div>
    </StageFrame>
  );
}

