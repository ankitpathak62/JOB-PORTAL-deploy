import { Job } from "../models/job.model.js";
import askAI from "../utils/aiClient.js";
//Admin job posting
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: experience,
      position,
      company: companyId,
      created_by: userId,
    });
    res.status(201).json({
      message: "Job posted successfully.",
      job,
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

//Users
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });

    if (!jobs) {
      return res.status(404).json({ message: "No jobs found", status: false });
    }
    return res.status(200).json({ jobs, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

//Users
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found", status: false });
    }
    return res.status(200).json({ job, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

// AI based "related jobs" recommendation for a single job.
export const getRecommendedJobs = async (req, res) => {
  try {
    const jobId = req.params.id;

    const currentJob = await Job.findById(jobId).populate("company");
    if (!currentJob) {
      return res.status(404).json({ message: "Job not found", status: false });
    }

    // all other jobs are the candidates we can recommend from
    // keep this small so the AI prompt stays light and responds fast
    const candidates = await Job.find({ _id: { $ne: jobId } })
      .populate("company")
      .sort({ createdAt: -1 })
      .limit(12);

    if (candidates.length === 0) {
      return res.status(200).json({ jobs: [], status: true });
    }

    // keep the prompt small - only send what the AI needs to compare
    const candidateList = candidates.map((job) => ({
      id: job._id.toString(),
      title: job.title,
      location: job.location,
      jobType: job.jobType,
      salary: job.salary,
      experienceLevel: job.experienceLevel,
      requirements: job.requirements,
    }));

    let recommendedIds = [];

    try {
      const systemPrompt =
        "You are a job recommendation engine. From the candidate jobs, pick the ones most related to the target job (similar role, skills, location or type). Reply ONLY with a JSON array of the matching candidate ids, ordered best first. No extra text.";

      const userPrompt = `Target job:\n${JSON.stringify({
        title: currentJob.title,
        location: currentJob.location,
        jobType: currentJob.jobType,
        salary: currentJob.salary,
        experienceLevel: currentJob.experienceLevel,
        requirements: currentJob.requirements,
      })}\n\nCandidate jobs:\n${JSON.stringify(candidateList)}`;

      const aiText = await askAI(systemPrompt, userPrompt);

      // the model should return a JSON array, but be safe and pull it out
      const match = aiText.match(/\[[\s\S]*\]/);
      if (match) {
        recommendedIds = JSON.parse(match[0]);
      }
    } catch (aiError) {
      console.error("AI recommendation failed, using fallback:", aiError.message);
    }

    let recommendedJobs = [];

    if (recommendedIds.length > 0) {
      // keep only valid ids and preserve the AI order
      const candidateMap = new Map(
        candidates.map((job) => [job._id.toString(), job])
      );
      recommendedJobs = recommendedIds
        .map((id) => candidateMap.get(id))
        .filter(Boolean);
    }

    // fallback - if AI gave nothing useful, match by jobType / location
    if (recommendedJobs.length === 0) {
      recommendedJobs = candidates.filter(
        (job) =>
          job.jobType === currentJob.jobType ||
          job.location === currentJob.location
      );
      if (recommendedJobs.length === 0) {
        recommendedJobs = candidates;
      }
    }

    return res.status(200).json({
      jobs: recommendedJobs.slice(0, 6),
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

//Admin job created

export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      sort: { createdAt: -1 },
    });
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found", status: false });
    }
    return res.status(200).json({ jobs, status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};
