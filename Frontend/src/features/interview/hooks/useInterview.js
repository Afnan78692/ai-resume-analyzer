import { useCallback, useContext } from "react";
import { InterviewContext } from "../interview.context-value";
import {
  generateInterviewReport,
  getInterviewReportById,
  getAllInterviewReports,
} from "../services/interview.api";

export const useInterview = () => {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } = context;

  const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile }) => {
    setLoading(true);

    try {
      const response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });

      const reportData = response?.interviewReport || response?.data?.interviewReport;

      if (!reportData) {
        throw new Error("No interview report returned from backend");
      }

      setReport(reportData);
      return reportData;
    } catch (error) {
      console.error("generateReport failed:", error);
      setReport(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReport]);

  const getReportById = useCallback(async (interviewId) => {
    setLoading(true);

    try {
      const response = await getInterviewReportById(interviewId);
      const reportData = response?.interviewReport || response?.data?.interviewReport;

      if (!reportData) {
        throw new Error("No interview report found");
      }

      setReport(reportData);
      return reportData;
    } catch (error) {
      console.error("getReportById failed:", error);
      setReport(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReport]);

  const getReports = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getAllInterviewReports();
      const reportsData = response?.interviewReports || response?.data?.interviewReports || [];

      setReports(reportsData);
      return reportsData;
    } catch (error) {
      console.error("getReports failed:", error);
      setReports([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReports]);

  return {
    loading,
    report,
    reports,
    generateReport,
    getReportById,
    getReports,
  };
};
