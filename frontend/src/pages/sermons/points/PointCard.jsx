import { Link, useParams } from "react-router-dom";

import React from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import privateInstance from "../../../axios/privateInstance";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const PointCard = ({ sermonPoint, handleEditSermonPoint }) => {
  const { sermonId } = useParams();

  const queryClient = useQueryClient();

  const handleEditSermonPointClick = (sermonPoint) => {
    handleEditSermonPoint(sermonPoint);
  };

  const handleDeleteSermonPoint = (sermonId) => {
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
          .delete(`/api/points/${sermonId}`)
          .then(() => {
            toast.success("Successfully deleted sermon.");
            queryClient.invalidateQueries(["points"]);
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
          <h4>{sermonPoint.title}</h4>

          <div className="d-flex-end-center">
            <div className="btn-group btn-group-sm">
              <Link
                className="btn btn-info"
                to={`/sermons/${sermonId}/points/${sermonPoint._id}`}
              >
                View
              </Link>
              <button
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#updateSermonPointModal"
                onClick={() => handleEditSermonPointClick(sermonPoint)}
              >
                Update
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteSermonPoint(sermonPoint._id)}
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

export default PointCard;
