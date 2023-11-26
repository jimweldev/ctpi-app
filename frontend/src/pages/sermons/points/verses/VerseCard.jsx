import React from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import privateInstance from "../../../../axios/privateInstance";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const VerseCard = ({ sermonVerse, handleEditSermonVerse }) => {
  const queryClient = useQueryClient();

  const handleEditSermonVerseClick = (sermonVerse) => {
    handleEditSermonVerse(sermonVerse);
  };

  const handleDeleteSermonVerse = (sermonId) => {
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
          .delete(`/api/verses/${sermonId}`)
          .then(() => {
            toast.success("Successfully deleted sermon.");
            queryClient.invalidateQueries(["verses"]);
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
          <h4>{sermonVerse.title}</h4>
          <div
            dangerouslySetInnerHTML={{
              __html: sermonVerse.description,
            }}
          ></div>

          <div className="d-flex-end-center">
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#updateSermonVerseModal"
                onClick={() => handleEditSermonVerseClick(sermonVerse)}
              >
                Update
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteSermonVerse(sermonVerse._id)}
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

export default VerseCard;
