// Learn Screen: Guided Missions M1-M3, Concept Checks, Scenario Code Share, and Quiz
// Spec B8, B9, Part C (L8 AC1, AC2, AC4, AC5, AC6)

import React, { useState } from 'react';
import { concepts } from '../../content/concepts.ts';
import { guidedMissions, GuidedMission } from '../../content/missions.ts';
import { quizQuestions } from '../../content/quiz.ts';
import { decodeScenarioCode, encodeScenarioCode } from '../../state/scenarioCode.ts';
import { useAppStore } from '../../state/store.tsx';

type LearnTab = 'missions' | 'concepts' | 'quiz' | 'share';

export const LearnScreen: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const [activeTab, setActiveTab] = useState<LearnTab>('missions');

  // Guided mission concept check state: missionId -> selectedOptionIndex
  const [missionAnswers, setMissionAnswers] = useState<Record<string, number | null>>({});
  const [missionChecked, setMissionChecked] = useState<Record<string, boolean>>({});

  // Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(quizQuestions.length).fill(-1),
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Scenario code import/export state
  const currentScenarioCode = encodeScenarioCode(state.design, state.rules);
  const [importCodeInput, setImportCodeInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(
    null,
  );
  const [copiedCode, setCopiedCode] = useState(false);

  const loadGuidedMission = (mission: GuidedMission) => {
    dispatch({
      type: 'LOAD_SCENARIO',
      design: mission.design,
      rules: mission.rules,
    });
    dispatch({ type: 'SET_SCREEN', screen: 'design' });
  };

  const handleConceptCheckSubmit = (missionId: string) => {
    setMissionChecked((prev) => ({ ...prev, [missionId]: true }));
  };

  const handleQuizSelect = (optionIdx: number) => {
    if (quizSubmitted) return;
    const nextAnswers = [...selectedAnswers];
    nextAnswers[currentQuizIdx] = optionIdx;
    setSelectedAnswers(nextAnswers);
  };

  const calculateScore = () => {
    let score = 0;
    selectedAnswers.forEach((ans, idx) => {
      if (ans === quizQuestions[idx]?.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleImportScenario = (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus(null);
    try {
      const decoded = decodeScenarioCode(importCodeInput.trim());
      dispatch({
        type: 'LOAD_SCENARIO',
        design: decoded.design,
        rules: decoded.rules,
      });
      setImportStatus({
        success: true,
        message: 'Scenario loaded successfully! Navigate to Design or Rehearse to inspect.',
      });
      setImportCodeInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid scenario code.';
      setImportStatus({
        success: false,
        message: `Import Error: ${msg}`,
      });
    }
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentScenarioCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      }
    } catch {
      // Fallback
      setCopiedCode(true);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Screen Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
          Junior Astronaut Academy
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Explore interactive mission challenges, examine ECLSS engineering concepts, test your
          astronaut readiness, and exchange mission scenario codes.
        </p>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '8px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'missions'}
          onClick={() => setActiveTab('missions')}
          style={{
            backgroundColor:
              activeTab === 'missions'
                ? 'var(--color-primary)'
                : 'var(--color-bg-surface-elevated)',
            color: activeTab === 'missions' ? '#fff' : 'var(--color-text-main)',
            fontWeight: 600,
          }}
        >
          Guided Missions (M1–M3)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'concepts'}
          onClick={() => setActiveTab('concepts')}
          style={{
            backgroundColor:
              activeTab === 'concepts'
                ? 'var(--color-primary)'
                : 'var(--color-bg-surface-elevated)',
            color: activeTab === 'concepts' ? '#fff' : 'var(--color-text-main)',
            fontWeight: 600,
          }}
        >
          Core Concepts
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'quiz'}
          onClick={() => setActiveTab('quiz')}
          style={{
            backgroundColor:
              activeTab === 'quiz' ? 'var(--color-primary)' : 'var(--color-bg-surface-elevated)',
            color: activeTab === 'quiz' ? '#fff' : 'var(--color-text-main)',
            fontWeight: 600,
          }}
        >
          Mission Quiz (6 Questions)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'share'}
          onClick={() => setActiveTab('share')}
          style={{
            backgroundColor:
              activeTab === 'share' ? 'var(--color-primary)' : 'var(--color-bg-surface-elevated)',
            color: activeTab === 'share' ? '#fff' : 'var(--color-text-main)',
            fontWeight: 600,
          }}
        >
          Share Scenario Codes
        </button>
      </div>

      {/* TAB 1: GUIDED MISSIONS (AC1) */}
      {activeTab === 'missions' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Select a guided training mission. Load the outpost parameters into your simulator and
              answer the accompanying engineering concept check.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {guidedMissions.map((m) => {
              const selectedOpt = missionAnswers[m.id];
              const isChecked = Boolean(missionChecked[m.id]);
              const isCorrect = selectedOpt === m.conceptCheck.correctIndex;

              return (
                <div key={m.id} className="panel-card" style={{ marginBottom: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'inline-block',
                          backgroundColor: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          marginBottom: '6px',
                        }}
                      >
                        {m.id} Training Module
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{m.title}</h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        {m.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => loadGuidedMission(m)}
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: '#fff',
                        fontWeight: 600,
                        padding: '8px 16px',
                      }}
                    >
                      Load into Simulator →
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      marginBottom: '16px',
                      backgroundColor: 'var(--color-bg-base)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <strong>Objective:</strong> {m.objective}
                  </p>

                  {/* Concept Check Section */}
                  <div
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '14px',
                      marginTop: '10px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        marginBottom: '10px',
                        color: 'var(--color-text-main)',
                      }}
                    >
                      💡 Concept Check: {m.conceptCheck.prompt}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {m.conceptCheck.options.map((opt, optIdx) => {
                        const isSelected = selectedOpt === optIdx;
                        let optionStyle: React.CSSProperties = {
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: isSelected
                            ? 'var(--color-bg-highlight)'
                            : 'var(--color-bg-surface-elevated)',
                          color: 'var(--color-text-main)',
                          cursor: isChecked ? 'default' : 'pointer',
                        };

                        if (isChecked) {
                          if (optIdx === m.conceptCheck.correctIndex) {
                            optionStyle = {
                              ...optionStyle,
                              backgroundColor: 'var(--color-success-bg)',
                              borderColor: 'var(--color-success)',
                              color: 'var(--color-success)',
                              fontWeight: 700,
                            };
                          } else if (isSelected && !isCorrect) {
                            optionStyle = {
                              ...optionStyle,
                              backgroundColor: 'var(--color-danger-bg)',
                              borderColor: 'var(--color-danger)',
                              color: 'var(--color-danger)',
                            };
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isChecked}
                            onClick={() =>
                              setMissionAnswers((prev) => ({ ...prev, [m.id]: optIdx }))
                            }
                            style={optionStyle}
                          >
                            <span style={{ fontWeight: 600, marginRight: '8px' }}>
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {!isChecked ? (
                      <div style={{ marginTop: '12px' }}>
                        <button
                          type="button"
                          disabled={selectedOpt === null || selectedOpt === undefined}
                          onClick={() => handleConceptCheckSubmit(m.id)}
                          style={{
                            backgroundColor: 'var(--color-bg-highlight)',
                            fontWeight: 600,
                          }}
                        >
                          Check Answer
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isCorrect
                            ? 'var(--color-success-bg)'
                            : 'var(--color-warning-bg)',
                          border: `1px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-warning)'}`,
                          fontSize: '0.9rem',
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: '4px',
                            color: isCorrect ? 'var(--color-success)' : 'var(--color-warning)',
                          }}
                        >
                          {isCorrect
                            ? '✓ Correct Astronaut Assessment!'
                            : '⚠️ Review Concept Notes'}
                        </div>
                        <p style={{ margin: 0, color: 'var(--color-text-main)', lineHeight: 1.4 }}>
                          {m.conceptCheck.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CORE CONCEPTS */}
      {activeTab === 'concepts' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {Object.values(concepts).map((c) => (
            <div key={c.id} className="panel-card" style={{ marginBottom: 0 }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: '4px',
                }}
              >
                Source Ref: {c.sourceRef}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>
                {c.title}
              </h3>
              <p
                style={{
                  color: 'var(--color-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '10px',
                }}
              >
                {c.subtitle}
              </p>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '14px' }}>
                {c.summary}
              </p>
              <div
                style={{
                  backgroundColor: 'var(--color-bg-base)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                }}
              >
                <strong>Mission Takeaway:</strong> {c.takeaway}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: MISSION QUIZ (AC2) */}
      {activeTab === 'quiz' && (
        <div className="panel-card">
          {!quizSubmitted ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '8px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Question {currentQuizIdx + 1} of {quizQuestions.length}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Stored in memory (Spec L8 AC2)
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
                {quizQuestions[currentQuizIdx]?.question}
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '24px',
                }}
              >
                {quizQuestions[currentQuizIdx]?.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuizIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleQuizSelect(optIdx)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        backgroundColor: isSelected
                          ? 'var(--color-bg-highlight)'
                          : 'var(--color-bg-surface-elevated)',
                        color: 'var(--color-text-main)',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      <span style={{ fontWeight: 700, marginRight: '10px' }}>
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <button
                  type="button"
                  disabled={currentQuizIdx === 0}
                  onClick={() => setCurrentQuizIdx((i) => i - 1)}
                  style={{ padding: '8px 16px' }}
                >
                  ← Previous
                </button>

                {currentQuizIdx < quizQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuizIdx((i) => i + 1)}
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      fontWeight: 600,
                      padding: '8px 20px',
                    }}
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setQuizSubmitted(true)}
                    style={{
                      backgroundColor: 'var(--color-success)',
                      color: '#fff',
                      fontWeight: 700,
                      padding: '10px 24px',
                    }}
                  >
                    Submit Mission Assessment ✓
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
                  Mission Readiness Score:{' '}
                  <span style={{ color: 'var(--color-primary)' }}>
                    {calculateScore()} / {quizQuestions.length} (
                    {Math.round((calculateScore() / quizQuestions.length) * 100)}%)
                  </span>
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  {calculateScore() >= 5
                    ? '🚀 Flight Qualified: You possess strong understanding of lunar life support and margins.'
                    : '⚠️ Flight Readiness Incomplete: Review the engineering explanations below and re-test.'}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                {quizQuestions.map((q, idx) => {
                  const userAns = selectedAnswers[idx];
                  const isCorrect = userAns === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-base)',
                        border: `1px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-warning)'}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          marginBottom: '6px',
                        }}
                      >
                        <span>{isCorrect ? '✓' : '✗'}</span>
                        <span>
                          Q{idx + 1}: {q.question}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--color-text-muted)',
                          marginBottom: '4px',
                        }}
                      >
                        Your Answer:{' '}
                        <strong
                          style={{
                            color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)',
                          }}
                        >
                          {userAns !== undefined && userAns >= 0
                            ? q.options[userAns]
                            : 'No answer selected'}
                        </strong>
                      </div>
                      {!isCorrect && (
                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--color-success)',
                            marginBottom: '4px',
                          }}
                        >
                          Correct Answer: <strong>{q.options[q.correctIndex]}</strong>
                        </div>
                      )}
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--color-text-main)',
                          margin: '4px 0 0 0',
                        }}
                      >
                        {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnswers(new Array(quizQuestions.length).fill(-1));
                    setQuizSubmitted(false);
                    setCurrentQuizIdx(0);
                  }}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    padding: '10px 24px',
                    fontWeight: 600,
                  }}
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SHARE SCENARIO CODES (AC4, AC5) */}
      {activeTab === 'share' && (
        <div>
          <div className="panel-card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Your Active Mission Scenario Code
            </h3>
            <p
              style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '14px' }}
            >
              Share this versioned code with team members to reproduce your exact outpost hardware
              and rule ladder setup bit-for-bit.
            </p>

            <div
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontSize: '0.9rem',
                backgroundColor: 'var(--color-bg-base)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                wordBreak: 'break-all',
                marginBottom: '12px',
              }}
            >
              {currentScenarioCode}
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              style={{
                backgroundColor: copiedCode ? 'var(--color-success)' : 'var(--color-primary)',
                color: '#fff',
                fontWeight: 600,
                padding: '8px 18px',
              }}
            >
              {copiedCode ? '✓ Copied to Clipboard!' : 'Copy Scenario Code'}
            </button>
          </div>

          <div className="panel-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Load Mission Scenario Code
            </h3>
            <p
              style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '14px' }}
            >
              Paste a friend’s scenario code starting with{' '}
              <code style={{ color: 'var(--color-primary)' }}>MM1-</code> to test their base design.
            </p>

            <form onSubmit={handleImportScenario}>
              <textarea
                rows={3}
                value={importCodeInput}
                onChange={(e) => setImportCodeInput(e.target.value)}
                placeholder="Paste MM1-... scenario code here"
                aria-label="Mission scenario code input"
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.85rem',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-elevated)',
                  color: 'var(--color-text-main)',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={!importCodeInput.trim()}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 600,
                    padding: '8px 18px',
                  }}
                >
                  Load Scenario Code →
                </button>
              </div>

              {importStatus && (
                <div
                  role="alert"
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: importStatus.success
                      ? 'var(--color-success-bg)'
                      : 'var(--color-danger-bg)',
                    border: `1px solid ${importStatus.success ? 'var(--color-success)' : 'var(--color-danger)'}`,
                    color: importStatus.success ? 'var(--color-success)' : 'var(--color-danger)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {importStatus.message}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
