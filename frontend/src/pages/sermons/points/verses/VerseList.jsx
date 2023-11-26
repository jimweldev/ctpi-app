import React from "react";
import VerseCard from "./VerseCard";
import { useForm } from "react-hook-form";
import privateInstance from "../../../../axios/privateInstance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import { modules } from "../../../../config/quill";

const VerseList = ({ pointId }) => {
  const queryClient = useQueryClient();

  const {
    data: verses,
    isLoading: versesIsLoading,
    isError: versesIsError,
  } = useQuery({
    queryKey: ["verses", pointId],
    queryFn: () =>
      privateInstance
        .get(`api/verses?pointId=${pointId}&sort=order`)
        .then((res) => res.data),
    keepPreviousData: true,
    // refetchInterval: 1000,
  });

  const handleAddSermonVerse = async (data) => {
    const modifiedData = {
      pointId,
      order: verses.records.length + 1,
      ...data,
    };

    privateInstance
      .post(`/api/verses`, modifiedData)
      .then(() => {
        toast.success("Successfully created verse.");
        queryClient.invalidateQueries(["verses"]);
        addSermonVerseReset();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleEditSermonVerse = (data) => {
    updateSermonVerseSetValue("_id", data._id);
    updateSermonVerseSetValue("order", data.order);
    updateSermonVerseSetValue("title", data.title);
    updateSermonVerseSetValue("description", data.description);
  };

  const handleUpdateSermonVerse = async (data) => {
    privateInstance
      .patch(`api/verses/${data._id}`, data)
      .then(() => {
        toast.success("Successfully updated sermon verse.");
        queryClient.invalidateQueries(["verses"]);
        updateSermonReset();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const {
    register: updateSermonVerseRegister,
    handleSubmit: updateSermonVerseHandleSubmit,
    setValue: updateSermonVerseSetValue,
    watch: updateSermonVerseWatch,
    formState: { errors: updateSermonVerseErrors },
    reset: updateSermonReset,
  } = useForm();

  const {
    register: addSermonVerseRegister,
    handleSubmit: addSermonVerseHandleSubmit,
    setValue: addSermonVerseSetValue,
    watch: addSermonVerseWatch,
    formState: { errors: addSermonVerseErrors },
    reset: addSermonVerseReset,
  } = useForm();

  return (
    <>
      <div className="d-flex-end-center mb-3">
        <button
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#addSermonVerseModal"
        >
          Add
        </button>
      </div>

      {!versesIsLoading &&
        !versesIsError &&
        verses.records.length !== 0 &&
        verses.records.map((user) => {
          return (
            <VerseCard
              sermonVerse={user}
              key={user._id}
              handleEditSermonVerse={handleEditSermonVerse}
            />
          );
        })}

      {/* Modals */}
      {/* add sermon verse */}
      <form
        className="modal fade"
        id="addSermonVerseModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={addSermonVerseHandleSubmit(handleAddSermonVerse)}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Add Sermon Verse</h1>
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
                  {...addSermonVerseRegister("title", { required: true })}
                />
                {addSermonVerseErrors.title && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Description</label>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  onChange={(content) =>
                    addSermonVerseSetValue("description", content)
                  }
                  value={addSermonVerseWatch("description")}
                />
                {addSermonVerseErrors.description && (
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

      {/* update sermon verse */}
      <form
        className="modal fade"
        id="updateSermonVerseModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={updateSermonVerseHandleSubmit(handleUpdateSermonVerse)}
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
                  {...updateSermonVerseRegister("_id", { required: true })}
                />
                {updateSermonVerseErrors._id && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Order</label>
                <input
                  className="form-control"
                  type="text"
                  {...updateSermonVerseRegister("order", { required: true })}
                />
                {updateSermonVerseErrors.order && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Title</label>
                <input
                  className="form-control"
                  type="text"
                  {...updateSermonVerseRegister("title", { required: true })}
                />
                {updateSermonVerseErrors.title && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Description</label>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  onChange={(content) =>
                    updateSermonVerseSetValue("description", content)
                  }
                  value={updateSermonVerseWatch("description")}
                />
                {updateSermonVerseErrors.description && (
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

export default VerseList;
