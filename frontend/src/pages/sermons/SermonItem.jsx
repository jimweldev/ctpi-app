import React from "react";
import OpeningList from "./openings/OpeningList";
import ClosingList from "./closings/ClosingList";
import PointList from "./points/PointList";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import privateInstance from "../../axios/privateInstance";
import { format } from "date-fns";

const SermonItem = () => {
  const { sermonId } = useParams();

  const {
    data: sermon,
    isLoading: sermonIsLoading,
    isError: sermonIsError,
  } = useQuery({
    queryKey: ["sermons", sermonId],
    queryFn: () =>
      privateInstance.get(`/api/sermons/${sermonId}`).then((res) => res.data),
    keepPreviousData: true,
    // refetchInterval: 1000,
  });

  return (
    <>
      <div className="d-flex-between-center mb-3">
        <h1 className="h3 mb-0">Sermon Item</h1>
        <Link className="btn btn-dark btn-sm" to={"/sermons"}>
          back
        </Link>
      </div>

      {sermon && !sermonIsLoading && !sermonIsError ? (
        <div className="row">
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h3 className="mb-1">{sermon.title}</h3>
                <div className="d-flex-between-center mb-3">
                  <p className="text-muted mb-0">{sermon.seriesId?.title}</p>
                  <p className="text-muted mb-0">
                    {format(new Date(sermon.date), "MMM. d, yyyy")}
                  </p>
                </div>

                <p>{sermon.description}</p>
                <div
                  dangerouslySetInnerHTML={{
                    __html: sermon.notes,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card">
              <div className="card-header pb-0">
                <nav>
                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    <button
                      className="nav-link active"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-openings"
                    >
                      Openings
                    </button>
                    <button
                      className="nav-link"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-points"
                    >
                      Points
                    </button>
                    <button
                      className="nav-link"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-closings"
                    >
                      Closings
                    </button>
                  </div>
                </nav>
              </div>
              <div className="card-body">
                <div className="tab-content">
                  <div className="tab-pane fade show active" id="nav-openings">
                    <OpeningList sermonId={sermonId} />
                  </div>
                  <div className="tab-pane fade" id="nav-points">
                    <PointList sermonId={sermonId} />
                  </div>
                  <div className="tab-pane fade" id="nav-closings">
                    <ClosingList sermonId={sermonId} />
                  </div>
                </div>
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

export default SermonItem;
