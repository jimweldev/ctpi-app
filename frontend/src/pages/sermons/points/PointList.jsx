import React from "react";
import PointCard from "./PointCard";
import { useForm } from "react-hook-form";
import privateInstance from "../../../axios/privateInstance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const PointList = ({ sermonId }) => {
  const queryClient = useQueryClient();

  const {
    data: points,
    isLoading: pointsIsLoading,
    isError: pointsIsError,
  } = useQuery({
    queryKey: ["points", sermonId],
    queryFn: () =>
      privateInstance
        .get(`/api/points?sermonId=${sermonId}&sort=order`)
        .then((res) => res.data),
    keepPreviousData: true,
    // refetchInterval: 1000,
  });

  const handleAddSermonPoint = async (data) => {
    const modifiedData = {
      sermonId,
      order: points.records.length + 1,
      ...data,
    };

    privateInstance
      .post(`/api/points`, modifiedData)
      .then(() => {
        toast.success("Successfully created point.");
        queryClient.invalidateQueries(["points"]);
        addSermonPointReset();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleEditSermonPoint = (data) => {
    updateSermonPointSetValue("_id", data._id);
    updateSermonPointSetValue("order", data.order);
    updateSermonPointSetValue("title", data.title);
    updateSermonPointSetValue("description", data.description);
  };

  const handleUpdateSermonPoint = async (data) => {
    privateInstance
      .patch(`/api/points/${data._id}`, data)
      .then(() => {
        toast.success("Successfully updated sermon point.");
        queryClient.invalidateQueries(["points"]);
        updateSermonReset();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const {
    register: updateSermonPointRegister,
    handleSubmit: updateSermonPointHandleSubmit,
    setValue: updateSermonPointSetValue,
    watch: updateSermonPointWatch,
    formState: { errors: updateSermonPointErrors },
    reset: updateSermonReset,
  } = useForm();

  const {
    register: addSermonPointRegister,
    handleSubmit: addSermonPointHandleSubmit,
    setValue: addSermonPointSetValue,
    watch: addSermonPointWatch,
    formState: { errors: addSermonPointErrors },
    reset: addSermonPointReset,
  } = useForm();

  return (
    <>
      <div className="d-flex-end-center mb-3">
        <button
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#addSermonPointModal"
        >
          Add
        </button>
      </div>

      {!pointsIsLoading &&
        !pointsIsError &&
        points.records.length !== 0 &&
        points.records.map((user) => {
          return (
            <PointCard
              sermonPoint={user}
              key={user._id}
              handleEditSermonPoint={handleEditSermonPoint}
            />
          );
        })}

      {/* Modals */}
      {/* add sermon point */}
      <form
        className="modal fade"
        id="addSermonPointModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={addSermonPointHandleSubmit(handleAddSermonPoint)}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Add Sermon Point</h1>
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
                  {...addSermonPointRegister("title", { required: true })}
                />
                {addSermonPointErrors.title && (
                  <span className="text-danger">This field is required</span>
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

      {/* update sermon point */}
      <form
        className="modal fade"
        id="updateSermonPointModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={updateSermonPointHandleSubmit(handleUpdateSermonPoint)}
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
                  {...updateSermonPointRegister("_id", { required: true })}
                />
                {updateSermonPointErrors._id && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Order</label>
                <input
                  className="form-control"
                  type="text"
                  {...updateSermonPointRegister("order", { required: true })}
                />
                {updateSermonPointErrors.order && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Title</label>
                <input
                  className="form-control"
                  type="text"
                  {...updateSermonPointRegister("title", { required: true })}
                />
                {updateSermonPointErrors.title && (
                  <span className="text-danger">This field is required</span>
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

export default PointList;
