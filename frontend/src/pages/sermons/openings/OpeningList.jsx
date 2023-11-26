import React from "react";
import OpeningCard from "./OpeningCard";
import { useForm } from "react-hook-form";
import privateInstance from "../../../axios/privateInstance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import { modules } from "../../../config/quill";

const OpeningList = ({ sermonId }) => {
  const queryClient = useQueryClient();

  const {
    data: openings,
    isLoading: openingsIsLoading,
    isError: openingsIsError,
  } = useQuery({
    queryKey: ["openings", sermonId],
    queryFn: () =>
      privateInstance
        .get(`/api/openings?sermonId=${sermonId}&sort=order`)
        .then((res) => res.data),
    keepPreviousData: true,
    // refetchInterval: 1000,
  });

  const handleAddSermonOpening = async (data) => {
    const modifiedData = {
      sermonId,
      order: openings.records.length + 1,
      ...data,
    };

    privateInstance
      .post(`/api/openings`, modifiedData)
      .then(() => {
        toast.success("Successfully created opening.");
        queryClient.invalidateQueries(["openings"]);
        addSermonOpeningReset();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleEditSermonOpening = (data) => {
    updateSermonOpeningSetValue("_id", data._id);
    updateSermonOpeningSetValue("order", data.order);
    updateSermonOpeningSetValue("title", data.title);
    updateSermonOpeningSetValue("description", data.description);
  };

  const handleUpdateSermonOpening = async (data) => {
    privateInstance
      .patch(`/api/openings/${data._id}`, data)
      .then(() => {
        toast.success("Successfully updated sermon opening.");
        queryClient.invalidateQueries(["openings"]);
        updateSermonReset();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const {
    register: updateSermonOpeningRegister,
    handleSubmit: updateSermonOpeningHandleSubmit,
    setValue: updateSermonOpeningSetValue,
    watch: updateSermonOpeningWatch,
    formState: { errors: updateSermonOpeningErrors },
    reset: updateSermonReset,
  } = useForm();

  const {
    register: addSermonOpeningRegister,
    handleSubmit: addSermonOpeningHandleSubmit,
    setValue: addSermonOpeningSetValue,
    watch: addSermonOpeningWatch,
    formState: { errors: addSermonOpeningErrors },
    reset: addSermonOpeningReset,
  } = useForm();

  return (
    <>
      <div className="d-flex-end-center mb-3">
        <button
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#addSermonOpeningModal"
        >
          Add
        </button>
      </div>

      {!openingsIsLoading &&
        !openingsIsError &&
        openings.records.length !== 0 &&
        openings.records.map((user) => {
          return (
            <OpeningCard
              sermonOpening={user}
              key={user._id}
              handleEditSermonOpening={handleEditSermonOpening}
            />
          );
        })}

      {/* Modals */}
      {/* add sermon opening */}
      <form
        className="modal fade"
        id="addSermonOpeningModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={addSermonOpeningHandleSubmit(handleAddSermonOpening)}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Add Sermon Opening</h1>
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
                  {...addSermonOpeningRegister("title", { required: true })}
                />
                {addSermonOpeningErrors.title && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Description</label>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  onChange={(content) =>
                    addSermonOpeningSetValue("description", content)
                  }
                  value={addSermonOpeningWatch("description")}
                />
                {addSermonOpeningErrors.description && (
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

      {/* update sermon opening */}
      <form
        className="modal fade"
        id="updateSermonOpeningModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={updateSermonOpeningHandleSubmit(handleUpdateSermonOpening)}
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
                  {...updateSermonOpeningRegister("_id", { required: true })}
                />
                {updateSermonOpeningErrors._id && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Order</label>
                <input
                  className="form-control"
                  type="text"
                  {...updateSermonOpeningRegister("order", { required: true })}
                />
                {updateSermonOpeningErrors.order && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Title</label>
                <input
                  className="form-control"
                  type="text"
                  {...updateSermonOpeningRegister("title", { required: true })}
                />
                {updateSermonOpeningErrors.title && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Description</label>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  onChange={(content) =>
                    updateSermonOpeningSetValue("description", content)
                  }
                  value={updateSermonOpeningWatch("description")}
                />
                {updateSermonOpeningErrors.description && (
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

export default OpeningList;
