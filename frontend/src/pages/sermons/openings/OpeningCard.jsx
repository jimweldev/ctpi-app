import React from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import privateInstance from "../../../axios/privateInstance";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const OpeningCard = ({ sermonOpening, handleEditSermonOpening }) => {
  const queryClient = useQueryClient();

  const handleEditSermonOpeningClick = (sermonOpening) => {
    handleEditSermonOpening(sermonOpening);
  };

  const handleDeleteSermonOpening = (sermonId) => {
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
          .delete(`/api/openings/${sermonId}`)
          .then(() => {
            toast.success("Successfully deleted sermon.");
            queryClient.invalidateQueries(["openings"]);
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
          <h4>{sermonOpening.title}</h4>
          <div
            dangerouslySetInnerHTML={{
              __html: sermonOpening.description,
            }}
          ></div>

          <div className="d-flex-end-center">
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#updateSermonOpeningModal"
                onClick={() => handleEditSermonOpeningClick(sermonOpening)}
              >
                Update
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteSermonOpening(sermonOpening._id)}
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

export default OpeningCard;
