import axios from "axios";

const privateInstance = axios.create({
  baseURL: import.meta.env.VITE_API,
  headers: {
    Accept: "application/json",
  },
});

export default privateInstance;
