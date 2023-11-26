import React, { useState } from "react";
import SeriesCard from "./SeriesCard";
import { FiSearch } from "react-icons/fi";
import ReactPaginate from "react-paginate";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Swal from "sweetalert2";

import privateInstance from "../../axios/privateInstance";
import useDebounce from "../../hooks/useDebounce";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Table from "../../components/Table";
import TableField from "../../components/TableField";
import TableFallback from "../../components/TableFallback";

const SeriesList = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-date");
  const [page, setPage] = useState(1);

  const debouncedSearchTerm = useDebounce(search, 200);

  const {
    data: series,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["series", { page, limit, sort, search: debouncedSearchTerm }],
    queryFn: () =>
      privateInstance
        .get(
          `/api/series/paginated?page=${page}&limit=${limit}&sort=${sort}&search=${debouncedSearchTerm}`
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

  const handleSort = (field) => {
    field === sort ? setSort(`-${field}`) : setSort(field);
    setPage(1);
  };

  const handlePage = (page) => setPage(page);

  const handleAddSeries = async (data) => {
    privateInstance
      .post(`/api/series`, data)
      .then(() => {
        toast.success("Successfully created series.");
        queryClient.invalidateQueries(["series"]);
        addSeriesReset();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleDeleteSeries = (seriesId) => {
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
          .delete(`/api/series/${seriesId}`)
          .then(() => {
            toast.success("Successfully deleted series.");
            queryClient.invalidateQueries([
              "series",
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
    register: addSeriesRegister,
    handleSubmit: addSeriesHandleSubmit,
    setValue: addSeriesSetValue,
    watch: addSeriesWatch,
    formState: { errors: addSeriesErrors },
    reset: addSeriesReset,
  } = useForm();

  return (
    <>
      <div className="d-flex-between-center mb-3">
        <h1 className="h3 mb-0">Series</h1>
        <button
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#addSeriesModal"
        >
          Add
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <Table
            handleSearch={handleSearch}
            handleLimit={handleLimit}
            handlePage={handlePage}
            limit={limit}
            page={page}
            data={series}
          >
            <thead>
              <tr>
                <th onClick={() => handleSort("_id")}>
                  <TableField column="ID" field="_id" sort={sort} />
                </th>
                <th onClick={() => handleSort("date")}>
                  <TableField column="Date" field="date" sort={sort} />
                </th>
                <th onClick={() => handleSort("title")}>
                  <TableField column="Title" field="title" sort={sort} />
                </th>
                <th onClick={() => handleSort("createdAt")}>
                  <TableField
                    column="Date Created"
                    field="createdAt"
                    sort={sort}
                  />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* has records */}
              {series &&
                !isLoading &&
                !isError &&
                series.records?.length !== 0 &&
                series.records?.map((s) => {
                  return (
                    <tr key={s._id}>
                      <td>{s._id}</td>
                      <td>{format(new Date(s.date), "MMM. d, yyyy")}</td>
                      <td>{s.title}</td>
                      <td>
                        {format(
                          new Date(s.createdAt),
                          "MMM. d, yyyy hh:mm:ss a"
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteSeries(s._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              <TableFallback
                isLoading={isLoading}
                isError={isError}
                dataLength={series ? series?.records?.length : 0}
              />
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      {/* add sermon */}
      <form
        className="modal fade"
        id="addSeriesModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        onSubmit={addSeriesHandleSubmit(handleAddSeries)}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Add Series</h1>
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
                  {...addSeriesRegister("date", { required: true })}
                />
                {addSeriesErrors.date && (
                  <span className="text-danger">This field is required</span>
                )}
              </div>
              <div className="mb-3">
                <label>Title</label>
                <input
                  className="form-control"
                  type="text"
                  {...addSeriesRegister("title", { required: true })}
                />
                {addSeriesErrors.title && (
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

export default SeriesList;
