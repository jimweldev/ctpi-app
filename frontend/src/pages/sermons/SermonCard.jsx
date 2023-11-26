import { format } from "date-fns";
import React from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

import { Link } from "react-router-dom";
import privateInstance from "../../axios/privateInstance";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const SermonCard = ({ sermon, handleEditSermon }) => {
  const queryClient = useQueryClient();

  const handleEditSermonClick = (data) => {
    handleEditSermon(data);
  };

  const handleDeleteSermon = (sermonId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this data!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#dc3545",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        privateInstance
          .delete(`/api/sermons/${sermonId}`)
          .then(() => {
            toast.success("Successfully deleted sermon.");
            queryClient.invalidateQueries(["sermons"]);
          })
          .catch((error) => {
            toast.error(error.message);
          });
      }
    });
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h4 className="fw-bold mb-1">{sermon.title}</h4>
          <div className="d-flex-between-center mb-3">
            <p className="text-muted mb-0">{sermon.seriesId?.title}</p>
            <p className="text-muted mb-0">
              {format(new Date(sermon.date), "MMM. d, yyyy")}
            </p>
          </div>

          <p>{sermon.description}</p>

          <div className="d-flex-end-center">
            <div className="btn-group btn-group-sm">
              <Link className="btn btn-info" to={`/sermons/${sermon._id}`}>
                View
              </Link>
              <button
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#updateSermonModal"
                onClick={() => handleEditSermonClick(sermon)}
              >
                Update
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteSermon(sermon._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SermonCard;
