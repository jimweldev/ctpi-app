import React from "react";

// icons
import { FiArrowUp } from "react-icons/fi";

const TableField = ({ column, field, sort }) => {
  return (
    <div className="d-flex justify-content-between align-items-center gap-2">
      <span>{column}</span>
      {(field === sort || `-${field}` === sort) && (
        <FiArrowUp className={`sort ${`-${field}` === sort && "rotate-180"}`} />
      )}
    </div>
  );
};

export default TableField;
