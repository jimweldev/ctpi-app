import React from "react";

const Loading = () => {
  return (
    <div className="d-flex justify-content-center align-items-center flex-column">
      <div className="spinner-grow text-primary mb-2">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
