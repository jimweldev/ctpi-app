import React, { useEffect } from "react";
import privateInstance from "./interceptors/privateInstance";

const App = () => {
  useEffect(() => {
    privateInstance
      .get("/todos/1")
      .then(function (response) {
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }, []);

  return <div>App</div>;
};

export default App;
