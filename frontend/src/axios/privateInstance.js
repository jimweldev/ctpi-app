import axios from "axios";

const privateInstance = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    Accept: "application/json",
  },
});

export default privateInstance;
