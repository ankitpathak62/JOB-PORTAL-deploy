import React, { useEffect, useState } from "react";
import Navbar from "../components_lite/Navbar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AdminJobsTable from "./AdminJobsTable";
import useGetAllAdminJobs from "@/hooks/useGetAllJAdminobs";
import { setSearchJobByText } from "@/redux/jobSlice";

const AdminJobs = () => {
  useGetAllAdminJobs();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="font-bold text-2xl mb-5">Posted Jobs</h1>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 sm:gap-0">
          <Input
            className="w-full sm:w-72 bg-white"
            placeholder="Filter by Company or Role"
            onChange={(e) => setInput(e.target.value)}
          ></Input>
          <Button
            className="w-full sm:w-auto bg-[#6B3AC2] hover:bg-[#5b30a6]"
            onClick={() => navigate("/admin/jobs/create")}
          >
            Post new Job
          </Button>
        </div>
        <AdminJobsTable />
      </div>
    </div>
  );
};

export default AdminJobs;
