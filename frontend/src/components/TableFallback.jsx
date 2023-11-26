import React from "react";

const TableFallback = ({ isLoading, isError, dataLength }) => {
  return (
    <>
      {/* no record */}
      {!isLoading && !isError && dataLength === 0 && (
        <tr>
          <td className="text-center" colSpan="100%">
            No records to show
          </td>
        </tr>
      )}

      {/* is loading */}
      {isLoading && (
        <tr>
          <td className="text-center" colSpan="100%">
            Loading...
          </td>
        </tr>
      )}

      {/* error */}
      {isError && (
        <tr>
          <td className="text-center" colSpan="100%">
            Error...
          </td>
        </tr>
      )}
    </>
  );
};

export default TableFallback;
