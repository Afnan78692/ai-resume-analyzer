const LoadingScreen = ({ title = "Building your interview plan", message = "Analyzing your profile, role fit, skill gaps, and practice roadmap." }) => (
  <main className="loading-screen">
    <div className="loading-orbit" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>

    <div className="loading-copy">
      <p className="loading-copy__eyebrow">AI report generation</p>
      <h1>{title}</h1>
      <p>{message}</p>
    </div>

    <div className="loading-steps" aria-label="Generation progress">
      <span>Resume</span>
      <span>Questions</span>
      <span>Roadmap</span>
    </div>
  </main>
);

export default LoadingScreen;
