import React from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import privateInstance from "../../../axios/privateInstance";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const ClosingCard = ({ sermonClosing, handleEditSermonClosing }) => {
  const queryClient = useQueryClient();

  const handleEditSermonClosingClick = (sermonClosing) => {
    handleEditSermonClosing(sermonClosing);
  };

  const handleDeleteSermonClosing = (sermonId) => {
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
          .delete(`/api/closings/${sermonId}`)
          .then(() => {
            toast.success("Successfully deleted sermon.");
            queryClient.invalidateQueries(["closings"]);
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
          <h4>{sermonClosing.title}</h4>
          <div
            dangerouslySetInnerHTML={{
              __html: sermonClosing.description,
            }}
          ></div>

          <div className="d-flex-end-center">
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#updateSermonClosingModal"
                onClick={() => handleEditSermonClosingClick(sermonClosing)}
              >
                Update
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteSermonClosing(sermonClosing._id)}
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

export default ClosingCard;
