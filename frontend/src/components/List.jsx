import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

// libraries
import ReactPaginate from "react-paginate";

const List = ({
  handleSearch,
  handlePage,
  handleSort,
  limit,
  page,
  data,
  children,
}) => {
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const handlePageClick = (event) => {
    handlePage(event.selected + 1);
  };

  useEffect(() => {
    handleSortChange();
  }, [sortColumn, sortOrder]);

  const handleSortChange = () => {
    handleSort(sortOrder + sortColumn);
  };

  return (
    <>
      <div className="row">
        <div className="col-lg-8">
          <div className="input-group mb-3">
            <span className="input-group-text">
              <FiSearch />
            </span>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="input-group">
            <span className="input-group-text">Order by</span>
            <select
              className="form-select"
              onChange={(e) => setSortColumn(e.target.value)}
            >
              <option value="title">Title</option>
              <option value="description">Description</option>
              <option value="date">Date Created</option>
            </select>
            <select
              className="form-select"
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">Ascending</option>
              <option value="-">Descending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">{children}</div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <label className="d-flex justify-content-between align-items-center">
          {`Showing ${
            data?.records.length > 0 ? (page - 1) * limit + 1 : 0
          } to ${(page - 1) * limit + data?.records.length} of ${
            data?.info.count
          } entries`}
        </label>

        <ReactPaginate
          containerClassName="pagination mb-0"
          pageCount={data?.info.pages || 1}
          marginPagesDisplayed="2"
          pageRangeDisplayed="3"
          onPageChange={handlePageClick}
          previousLabel={<span>&laquo;</span>}
          nextLabel={<span>&raquo;</span>}
          breakLabel="..."
          breakClassName="page-item disabled"
          breakLinkClassName="page-link"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          activeClassName="active"
        />
      </div>
    </>
  );
};

export default List;
