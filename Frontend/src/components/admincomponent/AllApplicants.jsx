import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "../components_lite/Navbar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Mail, Phone, Briefcase, Users } from "lucide-react";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";

const statusColor = {
  accepted: "bg-green-600",
  rejected: "bg-red-500",
  pending: "bg-gray-500",
};

const AllApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState("All");

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${APPLICATION_API_ENDPOINT}/recruiter/applicants`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setApplications(res.data.applications);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to load applicants");
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, []);

  // unique job roles (titles) for the side filter
  const roles = useMemo(() => {
    const titles = applications
      .map((app) => app?.job?.title)
      .filter(Boolean);
    return ["All", ...Array.from(new Set(titles))];
  }, [applications]);

  const filtered =
    activeRole === "All"
      ? applications
      : applications.filter((app) => app?.job?.title === activeRole);

  const statusHandler = async (status, id) => {
    try {
      const res = await axios.post(
        `${APPLICATION_API_ENDPOINT}/status/${id}/update`,
        { status },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        // reflect the new status locally
        setApplications((prev) =>
          prev.map((app) =>
            app._id === id ? { ...app, status: status.toLowerCase() } : app
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-[#6B3AC2]" />
          <h1 className="font-bold text-2xl">Applicants</h1>
          <Badge className="bg-[#6B3AC2] text-white">{applications.length}</Badge>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter by role */}
          <aside className="md:w-64 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:sticky md:top-20">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Briefcase size={18} /> Filter by Role
              </h2>
              {/* horizontal scroll on mobile, vertical list on desktop */}
              <div className="flex md:flex-col gap-2 overflow-x-auto pb-1">
                {roles.map((role) => {
                  const count =
                    role === "All"
                      ? applications.length
                      : applications.filter((a) => a?.job?.title === role).length;
                  return (
                    <button
                      key={role}
                      onClick={() => setActiveRole(role)}
                      className={`whitespace-nowrap text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center gap-2 ${
                        activeRole === role
                          ? "bg-[#6B3AC2] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="truncate">{role}</span>
                      <span
                        className={`text-xs px-1.5 rounded-full ${
                          activeRole === role
                            ? "bg-white/25"
                            : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Applicants list */}
          <main className="flex-1">
            {loading ? (
              <p className="text-gray-500">Loading applicants...</p>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
                No applicants{activeRole !== "All" ? ` for "${activeRole}"` : ""} yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((app) => (
                  <div
                    key={app._id}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg">
                          {app?.applicant?.fullname}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Applied for{" "}
                          <span className="font-medium text-[#6B3AC2]">
                            {app?.job?.title}
                          </span>
                          {app?.job?.company?.name
                            ? ` @ ${app.job.company.name}`
                            : ""}
                        </p>
                      </div>
                      <Badge
                        className={`${statusColor[app?.status] || "bg-gray-500"} capitalize shrink-0`}
                      >
                        {app?.status}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2 break-all">
                        <Mail size={15} className="shrink-0" />
                        {app?.applicant?.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone size={15} className="shrink-0" />
                        {app?.applicant?.phoneNumber}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      {app?.applicant?.profile?.resume ? (
                        <a
                          href={app.applicant.profile.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          View Resume / Portfolio
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No resume</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {app?.createdAt?.split("T")[0]}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => statusHandler("Accepted", app._id)}
                        disabled={app?.status === "accepted"}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => statusHandler("Rejected", app._id)}
                        disabled={app?.status === "rejected"}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllApplicants;
