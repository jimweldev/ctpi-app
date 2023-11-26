import React, { useState } from "react";

// libraries
import ReactPaginate from "react-paginate";
import { useForm } from "react-hook-form";
import Select from "react-select";
import ReactQuill from "react-quill";

// icons
import { FiSearch } from "react-icons/fi";
import SermonCard from "./SermonCard";
import useDebounce from "../../hooks/useDebounce";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import privateInstance from "../../axios/privateInstance";
import List from "../../components/List";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { modules } from "../../config/quill";

const SermonList = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(9);
  const [sort, setSort] = useState("-date");
  const [page, setPage] = useState(1);

  const debouncedSearchTerm = useDebounce(search, 200);

  const {
    data: series,
    isLoading: seriesIsLoading,
    isError: seriesIsError,
  } = useQuery({
    queryKey: ["series"],
    queryFn: () =>
      privateInstance.get(`/api/series`).then((res) =>
        res.data.records.map((item) => ({
          value: item._id,
          label: item.title,
        }))
      ),
    keepPreviousData: true,
    // refetchInterval: 1000,
  });

  const {
    data: sermons,
    isLoading: sermonsIsLoading,
    isError: sermonsIsError,
  } = useQuery({
    queryKey: ["sermons", { page, limit, sort, search: debouncedSearchTerm }],
    queryFn: () =>
      privateInstance
        .get(
          `/api/sermons/paginated?page=${page}&limit=${limit}&sort=${sort}&search=${debouncedSearchTerm}`
        )
        .then((res) => res.data),
    keepPreviousData: true,
    // refetchInterval: 1000,
  });

  const handleSearch = (search) => {
    setPage(1);
    setSearch(search);
  };

  const handleLimit = (limit) => {
    setPage(1);
    setLimit(limit);
  };

  const handleSort = (value) => {
    setSort(value);
    setPage(1);
  };

  const handlePage = (page) => setPage(page);

  const handleAddSermon = async (data) => {
    const modifiedData = {
      ...data,
      seriesId: data.seriesId.value,
    };

    privateInstance
      .post(`/api/sermons`, modifiedData)
      .then(() => {
        toast.success("Successfully created sermon.");
        queryClient.invalidateQueries([
          "sermons",
          { page, limit, sort, search: debouncedSearchTerm },
        ]);
        addSermonReset();
        addSermonSetValue("seriesId", null);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleEditSermon = (sermon) => {
    const sermonValue = {
      value: sermon.seriesId["_id"],
      label: sermon.seriesId["title"],
    };

    updateSermonSetValue("_id", sermon._id);
    updateSermonSetValue("date", format(new Date(sermon.date), "yyyy-MM-dd"));
    updateSermonSetValue("seriesId", sermonValue);
    updateSermonSetValue("title", sermon.title);
    updateSermonSetValue("description", sermon.description);
    updateSermonSetValue("notes", sermon.notes);
  };

  const handleUpdateSermon = async (data) => {
    const modifiedData = {
      ...data,
      seriesId: data.seriesId.value,
    };

    privateInstance
      .patch(`/api/sermons/${data._id}`, modifiedData)
      .then(() => {
        toast.success("Successfully updated sermon opening.");
        queryClient.invalidateQueries(["sermons"]);
        updateSermonReset();
      })
      .catch((error) => {
        toast.error(error.message);
      });
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
            queryClient.invalidateQueries([
              "sermons",
              { page, limit, sort, search: debouncedSearchTerm },
            ]);
          })
          .catch((error) => {
            toast.error(error.message);
          });
      }
    });
  };

  const {
    register: addSermonRegister,
    handleSubmit: addSermonHandleSubmit,
    setValue: addSermonSetValue,
    watch: addSermonWatch,
    formState: { errors: addSermonErrors },
    reset: addSermonReset,
  } = useForm();

  const {
    register: updateSermonRegister,
    handleSubmit: updateSermonHandleSubmit,
    setValue: updateSermonSetValue,
    watch: updateSermonWatch,
    formState: { errors: updateSermonErrors },
    reset: updateSermonReset,
  } = useForm();

  return (
    <>
      <div className="d-flex-between-center mb-3">
        <h1 className="h3 mb-0">Sermons</h1>
        <button
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#addSermonModal"
        >
          Add
        </button>
      </div>

      <List
        handleSearch={handleSearch}
        handleLimit={handleLimit}
        handlePage={handlePage}
        handleSort={handleSort}
        handleDelete={handleDeleteSermon}
        limit={limit}
        page={page}
        data={sermons}
      >
        {!sermonsIsLoading &&
          !sermonsIsError &&
          sermons.records.length !== 0 &&
          sermons.records.map((user) => {
            return (
              <div className="col-lg-4" key={user._id}>
                <SermonCard sermon={user} handleEditSermon={handleEditSermon} />
              </div>
            );
          })}
      </List>

      {/* Modals */}
      {/* add sermon */}
      <form
        className="modal fade"
        id="addSermonModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={addSermonHandleSubmit(handleAddSermon)}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Add Sermon</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Date</label>
                <input
                  className="form-control"
                  type="date"
                  {...addSermonRegister("date", { required: true })}
                />
                {addSermonErrors.date && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Series</label>
                <Select
                  options={series}
                  onChange={(data) => addSermonSetValue("seriesId", data)}
                  value={addSermonWatch("seriesId")}
                />
                {addSermonErrors.seriesId && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Title</label>
                <input
                  className="form-control"
                  type="text"
                  {...addSermonRegister("title", { required: true })}
                />
                {addSermonErrors.title && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Description</label>
                <textarea
                  className="form-control"
                  type="text"
                  {...addSermonRegister("description", { required: true })}
                />
                {addSermonErrors.description && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Notes</label>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  onChange={(content) => addSermonSetValue("notes", content)}
                  value={addSermonWatch("notes")}
                />
                {addSermonErrors.notes && <span>This field is required</span>}
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

      {/* update sermon */}
      <form
        className="modal fade"
        id="updateSermonModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={updateSermonHandleSubmit(handleUpdateSermon)}
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
                  {...updateSermonRegister("_id", { required: true })}
                />
                {updateSermonErrors._id && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Date</label>
                <input
                  className="form-control"
                  type="date"
                  {...updateSermonRegister("date", { required: true })}
                />
                {updateSermonErrors.date && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Series</label>
                <Select
                  options={series}
                  onChange={(data) => updateSermonSetValue("seriesId", data)}
                  value={updateSermonWatch("seriesId")}
                />
                {updateSermonErrors.seriesId && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Title</label>
                <input
                  className="form-control"
                  type="text"
                  {...updateSermonRegister("title", { required: true })}
                />
                {updateSermonErrors.title && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Description</label>
                <textarea
                  className="form-control"
                  type="text"
                  {...updateSermonRegister("description", { required: true })}
                />
                {updateSermonErrors.description && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Notes</label>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  onChange={(content) => updateSermonSetValue("notes", content)}
                  value={updateSermonWatch("notes")}
                />
                {updateSermonErrors.notes && (
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

export default SermonList;
