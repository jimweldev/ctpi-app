import React from "react";
import ClosingCard from "./ClosingCard";
import { useForm } from "react-hook-form";
import privateInstance from "../../../axios/privateInstance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import { modules } from "../../../config/quill";

const ClosingList = ({ sermonId }) => {
  const queryClient = useQueryClient();

  const {
    data: closings,
    isLoading: closingsIsLoading,
    isError: closingsIsError,
  } = useQuery({
    queryKey: ["closings", sermonId],
    queryFn: () =>
      privateInstance
        .get(`/api/closings?sermonId=${sermonId}&sort=order`)
        .then((res) => res.data),
    keepPreviousData: true,
    // refetchInterval: 1000,
  });

  const handleAddSermonClosing = async (data) => {
    const modifiedData = {
      sermonId,
      order: closings.records.length + 1,
      ...data,
    };

    privateInstance
      .post(`/api/closings`, modifiedData)
      .then(() => {
        toast.success("Successfully created closing.");
        queryClient.invalidateQueries(["closings"]);
        addSermonClosingReset();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleEditSermonClosing = (data) => {
    updateSermonClosingSetValue("_id", data._id);
    updateSermonClosingSetValue("order", data.order);
    updateSermonClosingSetValue("title", data.title);
    updateSermonClosingSetValue("description", data.description);
  };

  const handleUpdateSermonClosing = async (data) => {
    privateInstance
      .patch(`/api/closings/${data._id}`, data)
      .then(() => {
        toast.success("Successfully updated sermon closing.");
        queryClient.invalidateQueries(["closings"]);
        updateSermonReset();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const {
    register: updateSermonClosingRegister,
    handleSubmit: updateSermonClosingHandleSubmit,
    setValue: updateSermonClosingSetValue,
    watch: updateSermonClosingWatch,
    formState: { errors: updateSermonClosingErrors },
    reset: updateSermonReset,
  } = useForm();

  const {
    register: addSermonClosingRegister,
    handleSubmit: addSermonClosingHandleSubmit,
    setValue: addSermonClosingSetValue,
    watch: addSermonClosingWatch,
    formState: { errors: addSermonClosingErrors },
    reset: addSermonClosingReset,
  } = useForm();

  return (
    <>
      <div className="d-flex-end-center mb-3">
        <button
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#addSermonClosingModal"
        >
          Add
        </button>
      </div>

      {!closingsIsLoading &&
        !closingsIsError &&
        closings.records.length !== 0 &&
        closings.records.map((user) => {
          return (
            <ClosingCard
              sermonClosing={user}
              key={user._id}
              handleEditSermonClosing={handleEditSermonClosing}
            />
          );
        })}

      {/* Modals */}
      {/* add sermon closing */}
      <form
        className="modal fade"
        id="addSermonClosingModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={addSermonClosingHandleSubmit(handleAddSermonClosing)}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Add Sermon Closing</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Title</label>
                <input
                  className="form-control"
                  type="text"
                  {...addSermonClosingRegister("title", { required: true })}
                />
                {addSermonClosingErrors.title && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Description</label>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  onChange={(content) =>
                    addSermonClosingSetValue("description", content)
                  }
                  value={addSermonClosingWatch("description")}
                />
                {addSermonClosingErrors.description && (
                  <span>This field is required</span>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button className="btn btn-success">Save</button>
            </div>
          </div>
        </div>
      </form>

      {/* update sermon closing */}
      <form
        className="modal fade"
        id="updateSermonClosingModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={updateSermonClosingHandleSubmit(handleUpdateSermonClosing)}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Update Sermon</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>ID</label>
                <input
                  className="form-control"
                  type="text"
                  {...updateSermonClosingRegister("_id", { required: true })}
                />
                {updateSermonClosingErrors._id && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Order</label>
                <input
                  className="form-control"
                  type="text"
                  {...updateSermonClosingRegister("order", { required: true })}
                />
                {updateSermonClosingErrors.order && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Title</label>
                <input
                  className="form-control"
                  type="text"
                  {...updateSermonClosingRegister("title", { required: true })}
                />
                {updateSermonClosingErrors.title && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Description</label>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  onChange={(content) =>
                    updateSermonClosingSetValue("description", content)
                  }
                  value={updateSermonClosingWatch("description")}
                />
                {updateSermonClosingErrors.description && (
                  <span>This field is required</span>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button className="btn btn-success">Save</button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default ClosingList;
