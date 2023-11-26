import React from "react";

// libraries
import { Routes, Route, Navigate } from "react-router-dom";

// layouts
import PrivateLayout from "./layouts/PrivateLayout";

// pages
// private
import Dashboard from "./pages/Dashboard";
import SermonList from "./pages/sermons/SermonList";
import SermonItem from "./pages/sermons/SermonItem";
import PointItem from "./pages/sermons/points/PointItem";
import SeriesList from "./pages/series/SeriesList";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/*" element={<PrivateRoutes />} />
      </Routes>
    </>
  );
};

export default App;

/*******************************************
 ***** PRIVATE ROUTES
 *******************************************/
export const PrivateRoutes = () => {
  return (
    <Routes>
      <Route element={<PrivateLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/series" element={<SeriesList />} />
        <Route path="/sermons" element={<SermonList />} />
        <Route path="/sermons/:sermonId" element={<SermonItem />} />
        <Route
          path="/sermons/:sermonId/points/:pointId"
          element={<PointItem />}
        />
      </Route>

      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
/*******************************************/
