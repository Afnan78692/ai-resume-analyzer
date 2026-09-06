import React, { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router";
import LoadingScreen from "../components/LoadingScreen.jsx";

const Home = () => {
  const { loading, generateReport } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resumeName, setResumeName] = useState("");
  const resumeInputRef = useRef();
  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current?.files?.[0];

    if (!resumeFile && !selfDescription.trim()) {
      alert("Please upload a resume or add a self-description.");
      return;
    }

    try {
      const data = await generateReport({ jobDescription, selfDescription, resumeFile });
      if (!data || !data._id) {
        throw new Error("No report was created.");
      }
      navigate(`/interview/${data._id}`);
    } catch (error) {
      console.error("Generate report failed:", error);
      alert("Report generation failed. Please try again.");
    }
  };

  if (loading) {
    return <LoadingScreen title="Generating your interview strategy" />;
  }

  return (
    <div className="home-page">
      <header className="page-header">
        <h1>Create Your Custom <span className="highlight">Interview Plan</span></h1>
        <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
      </header>

      <div className="interview-card">
        <div className="interview-card__body">
          <div className="panel panel--left">
            <div className="panel__header">
              <div>
                <span className="panel__kicker">Role signal</span>
                <h2>Target Job Description</h2>
              </div>
            </div>
            <textarea
              onChange={(e) => setJobDescription(e.target.value)}
              value={jobDescription}
              className="panel__textarea"
              placeholder="Paste the job description..."
            />
            <span className="panel__counter">{jobDescription.length} characters</span>
          </div>

          <div className="panel-divider" />

          <div className="panel panel--right">
            <div className="panel__header">
              <div>
                <span className="panel__kicker">Candidate context</span>
                <h2>Your Profile</h2>
              </div>
            </div>

            <div className="upload-section">
              <label className="dropzone" htmlFor="resume">
                <span className="dropzone__mark">PDF</span>
                <p className="dropzone__title">Click to upload your resume</p>
                <p className="dropzone__subtitle">{resumeName || "PDF or DOCX resume file"}</p>
                <input
                  ref={resumeInputRef}
                  hidden
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,.docx"
                  onChange={(e) => setResumeName(e.target.files?.[0]?.name || "")}
                />
              </label>
            </div>

            <div className="self-description">
              <label className="section-label" htmlFor="selfDescription">
                Quick Self-Description
              </label>
              <textarea
                id="selfDescription"
                onChange={(e) => setSelfDescription(e.target.value)}
                value={selfDescription}
                className="panel__textarea panel__textarea--short"
                placeholder="Briefly describe your experience..."
              />
              <span className="panel__counter">{selfDescription.length} characters</span>
            </div>
          </div>
        </div>

        <div className="interview-card__footer">
          <button onClick={handleGenerateReport} className="generate-btn">
            <span className="generate-btn__shine" />
            <span>Generate My Interview Strategy</span>
            <span className="generate-btn__arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
