import React from "react";

// libraries
import ReactPaginate from "react-paginate";

const Table = ({
  handleSearch,
  handleLimit,
  handlePage,
  limit,
  page,
  data,
  children,
}) => {
  const handlePageClick = (event) => {
    handlePage(event.selected + 1);
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <label className="d-flex justify-content-between align-items-center gap-1">
          <span>Show</span>
          <select
            className="form-select"
            onChange={(e) => handleLimit(e.target.value)}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>entries</span>
        </label>

        <label className="d-flex justify-content-between align-items-center gap-1">
          <span>Search: </span>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </label>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">{children}</table>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <label className="d-flex justify-content-between align-items-center">
          {`Showing ${
            data?.records?.length > 0 ? (page - 1) * limit + 1 : 0
          } to ${(page - 1) * limit + data?.records?.length} of ${
            data?.info?.count
          } entries`}
        </label>

        <ReactPaginate
          containerClassName="pagination mb-0"
          pageCount={data?.info?.pages || 1}
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

export default Table;
