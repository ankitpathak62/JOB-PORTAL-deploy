import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Edit2, Eye, Calendar, MapPin } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AdminJobsTable = () => {
  const { companies } = useSelector((store) => store.company);
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);
  const navigate = useNavigate();

  const [filterJobs, setFilterJobs] = useState(allAdminJobs);

  useEffect(() => {
    const filteredJobs =
      allAdminJobs.length >= 0 &&
      allAdminJobs.filter((job) => {
        if (!searchJobByText) {
          return true;
        }
        return (
          job.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
          job?.company?.name
            ?.toLowerCase()
            .includes(searchJobByText.toLowerCase())
        );
      });
    setFilterJobs(filteredJobs);
  }, [allAdminJobs, searchJobByText]);

  if (!companies) {
    return <div>Loading...</div>;
  }

  if (!filterJobs || filterJobs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
        No jobs posted yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filterJobs.map((job) => (
        <div
          key={job._id}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col"
        >
          <div className="flex-1">
            <p className="text-sm text-gray-500">{job?.company?.name}</p>
            <h3 className="font-bold text-lg text-gray-900 mt-0.5">
              {job?.title}
            </h3>

            <div className="flex flex-wrap gap-2 mt-3">
              {job?.location && (
                <Badge variant="ghost" className="text-[#6B3AC2] font-semibold">
                  <MapPin size={13} className="mr-1" />
                  {job.location}
                </Badge>
              )}
              {job?.jobType && (
                <Badge variant="ghost" className="text-[#FA4F09] font-semibold">
                  {job.jobType}
                </Badge>
              )}
              {job?.salary && (
                <Badge variant="ghost" className="text-blue-600 font-semibold">
                  {job.salary} LPA
                </Badge>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
              <Calendar size={13} />
              Posted on {job?.createdAt?.split("T")[0]}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/admin/companies/${job._id}`)}
              className="flex-1 flex items-center gap-2"
            >
              <Edit2 size={15} />
              Edit
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
              className="flex-1 flex items-center gap-2 bg-[#6B3AC2] hover:bg-[#5b30a6]"
            >
              <Eye size={15} />
              Applicants
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminJobsTable;
