import React from "react";
import { Link, useParams } from "react-router-dom";
import VerseList from "./verses/VerseList";
import { useQuery } from "@tanstack/react-query";
import privateInstance from "../../../axios/privateInstance";

const PointItem = () => {
  const { sermonId, pointId } = useParams();

  const {
    data: point,
    isLoading: pointIsLoading,
    isError: pointIsError,
  } = useQuery({
    queryKey: ["points", pointId],
    queryFn: () =>
      privateInstance.get(`/api/points/${pointId}`).then((res) => res.data),
    keepPreviousData: true,
    // refetchInterval: 1000,
  });

  return (
    <>
      <div className="d-flex-between-center mb-3">
        <h1 className="h3 mb-0">PointItem</h1>
        <Link className="btn btn-dark btn-sm" to={`/sermons/${sermonId}`}>
          back
        </Link>
      </div>

      {point && !pointIsLoading && !pointIsError ? (
        <div className="row">
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="mb-0">{point.title}</h5>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <VerseList pointId={pointId} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading</div>
      )}
    </>
  );
};

export default PointItem;
