const { PDFParse } = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function parsePdfText(buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    await parser.destroy();
  }
}

async function generateInterViewReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    const resumeContent = await parsePdfText(req.file.buffer);

    const { selfDescription, jobDescription } = req.body;

    const aiReport = await generateInterviewReport({
      resume: resumeContent,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      title: aiReport.title || "Interview Report",
      matchScore: aiReport.matchScore || 0,
      technicalQuestions: aiReport.technicalQuestions || [],
      behavioralQuestions: aiReport.behavioralQuestions || [],
      skillGaps: aiReport.skillGaps || [],
      preparationPlan: aiReport.preparationPlan || [],
    });

    return res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport,
    });
  } catch (error) {
    console.error("generateInterViewReportController error:", error);
    return res.status(500).json({
      message: error.message || "Failed to generate interview report",
    });
  }
}

async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found.",
      });
    }

    return res.status(200).json({
      message: "Interview report fetched successfully.",
      interviewReport,
    });
  } catch (error) {
    console.error("getInterviewReportByIdController error:", error);
    return res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
}

async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Interview reports fetched successfully.",
      interviewReports,
    });
  } catch (error) {
    console.error("getAllInterviewReportsController error:", error);
    return res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
}

async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findById(interviewReportId);

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found.",
      });
    }

    const pdfBuffer = await generateResumePdf({
      resume: interviewReport.resume,
      jobDescription: interviewReport.jobDescription,
      selfDescription: interviewReport.selfDescription,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("generateResumePdfController error:", error);
    return res.status(500).json({
      message: error.message || "Failed to generate resume pdf",
    });
  }
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
