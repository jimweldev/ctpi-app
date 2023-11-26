import React from "react";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="p-5">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
