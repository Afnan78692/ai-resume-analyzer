import React, { useState, useEffect } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useParams } from "react-router";
import LoadingScreen from "../components/LoadingScreen.jsx";

const NAV_ITEMS = [
  { id: "technical", label: "Technical Questions", icon: "⌘" },
  { id: "behavioral", label: "Behavioral Questions", icon: "◌" },
  { id: "roadmap", label: "Road Map", icon: "↗" },
];

const safeArray = (value) => Array.isArray(value) ? value : [];
const clampScore = (score) => Math.min(Math.max(Number(score) || 0, 0), 100);
const normalizeSeverity = (severity) => {
  const normalized = String(severity || "medium").toLowerCase();

  return ["high", "medium", "low"].includes(normalized) ? normalized : "medium";
};
const getTopicHardness = (skill = "") => {
  const topic = skill.toLowerCase();

  if (
    /postgres|sql|database|data modeling|schema|testing|integration|security|authentication|authorization/.test(topic)
  ) {
    return "high";
  }

  if (/typescript|react|node|express|api|performance|state/.test(topic)) {
    return "medium";
  }

  return null;
};
const getSkillSeverity = (gap) => {
  const skill = typeof gap === "string" ? gap : gap.skill;

  return getTopicHardness(skill) || normalizeSeverity(gap.severity);
};
const getQuestionText = (question, index, type) => {
  if (typeof question === "string") {
    return question;
  }

  return question?.question || `${type} question ${index + 1}`;
};
const getQuestionDetail = (question, field) => (typeof question === "string" ? "" : question?.[field]);
const getSkillLabel = (gap) => (typeof gap === "string" ? gap : gap.skill);
const getRoadmapDay = (day, index) => (typeof day === "object" && day?.day ? day.day : index + 1);
const getRoadmapFocus = (day, index) => {
  if (typeof day === "string") {
    return `Preparation Day ${index + 1}`;
  }

  return day?.focus || `Preparation Day ${index + 1}`;
};
const getRoadmapTasks = (day) => {
  if (typeof day === "string") {
    return [day];
  }

  if (Array.isArray(day?.tasks)) {
    return day.tasks;
  }

  return day?.task ? [day.task] : [];
};
const getScoreLabel = (score) => {
  if (score >= 85) {
    return "Strong match";
  }

  if (score >= 70) {
    return "Good match";
  }

  return "Needs focus";
};

const QuestionCard = ({ question, index, type }) => (
  <article className="q-card">
    <div className="q-card__header">
      <span className="q-card__index">{String(index + 1).padStart(2, "0")}</span>
      <p className="q-card__question">{getQuestionText(question, index, type)}</p>
    </div>

    <div className="q-card__body">
      {getQuestionDetail(question, "intention") && (
        <div className="q-card__section">
          <span className="q-card__tag q-card__tag--intention">Intention</span>
          <p>{getQuestionDetail(question, "intention")}</p>
        </div>
      )}

      {getQuestionDetail(question, "answer") && (
        <div className="q-card__section">
          <span className="q-card__tag q-card__tag--answer">Suggested Answer</span>
          <p>{getQuestionDetail(question, "answer")}</p>
        </div>
      )}
    </div>
  </article>
);

const Interview = () => {
  const [activeNav, setActiveNav] = useState("technical");
  const { report, getReportById, loading } = useInterview();
  const { interviewId } = useParams();

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    }
  }, [getReportById, interviewId]);

  if (loading) {
    return <LoadingScreen title="Opening your interview report" message="Loading the questions, score, skill gaps, and preparation roadmap." />;
  }

  if (!report) {
    return (
      <main className="loading-screen">
        <h1>No interview report found.</h1>
      </main>
    );
  }

  const technicalQuestions = safeArray(report.technicalQuestions);
  const behavioralQuestions = safeArray(report.behavioralQuestions);
  const preparationPlan = safeArray(report.preparationPlan);
  const skillGaps = safeArray(report.skillGaps);

  const matchScore = clampScore(report.matchScore);
  const scoreColor =
    matchScore >= 85
      ? "score--high"
      : matchScore >= 70
        ? "score--mid"
        : "score--low";

  return (
    <div className="interview-page">
      <div className="interview-layout">
        <nav className="interview-nav">
          <div className="nav-content">
            <p className="interview-nav__label">Sections</p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="interview-nav__icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="interview-divider" />

	        <main className="interview-content">
          <header className="report-title">
            <span className="report-title__kicker">Interview report</span>
            <h1>{report.title || "Interview Strategy"}</h1>
          </header>

          {activeNav === "technical" && (
            <section>
              <div className="content-header">
                <h2>Technical Questions</h2>
                <span className="content-header__count">{technicalQuestions.length} questions</span>
              </div>

              <div className="q-list">
                {technicalQuestions.map((q, i) => (
                  <QuestionCard key={i} question={q} index={i} type="Technical" />
                ))}
              </div>
            </section>
          )}

          {activeNav === "behavioral" && (
            <section>
              <div className="content-header">
                <h2>Behavioral Questions</h2>
                <span className="content-header__count">{behavioralQuestions.length} questions</span>
              </div>

              <div className="q-list">
                {behavioralQuestions.map((q, i) => (
                  <QuestionCard key={i} question={q} index={i} type="Behavioral" />
                ))}
              </div>
            </section>
          )}

          {activeNav === "roadmap" && (
            <section>
              <div className="content-header">
                <h2>Preparation Road Map</h2>
                <span className="content-header__count">{preparationPlan.length}-day plan</span>
              </div>

              <div className="roadmap-list">
                {preparationPlan.map((day, i) => (
                  <article key={i} className="roadmap-day">
                    <div className="roadmap-day__header">
                      <span className="roadmap-day__badge">Day {getRoadmapDay(day, i)}</span>
                      <h3 className="roadmap-day__focus">{getRoadmapFocus(day, i)}</h3>
                    </div>

                    <ul className="roadmap-day__tasks">
                      {getRoadmapTasks(day).map((task, idx) => (
                        <li key={idx}>
                          <span className="roadmap-day__bullet" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>

        <div className="interview-divider" />

        <aside className="interview-sidebar">
          <div className="match-score">
            <p className="match-score__label">Match Score</p>
            <div className={`match-score__ring ${scoreColor}`} style={{ "--score": matchScore }}>
              <span className="match-score__value">{matchScore}</span>
              <span className="match-score__pct">%</span>
            </div>
            <p className={`match-score__sub ${scoreColor}`}>{getScoreLabel(matchScore)}</p>
          </div>

          <div className="skill-gaps">
            <p className="skill-gaps__label">Skill Gaps</p>
            <div className="skill-gaps__list">
              {skillGaps.map((gap, i) => (
                <span key={i} className={`skill-tag skill-tag--${getSkillSeverity(gap)}`}>
                  {getSkillLabel(gap)}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Interview;
