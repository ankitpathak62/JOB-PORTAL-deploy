import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    <div>
      {/* Footer for the current page */}
      <div className="text-center p-4 md:p-8 bg-[#f1f1f1] text-sm md:text-base flex flex-col gap-2">
        <p>© 2025 Sunfire Sensei. All rights reserved.</p>
        <p>
          Powered by <a href="https://github.com/ankitpathak62" className="text-blue-600 hover:underline">Ankit Pathak</a>
        </p>
        <p className="flex flex-wrap justify-center gap-2">
          <Link to={"/PrivacyPolicy"} className="hover:text-[#FA4F09] transition-colors">Privacy Policy </Link> 
          <span className="hidden sm:inline">|</span>
          <Link to={"/TermsofService"} className="hover:text-[#FA4F09] transition-colors"> Terms of Service</Link>
        </p>
      </div>
    </div>
};

export default Footer;
