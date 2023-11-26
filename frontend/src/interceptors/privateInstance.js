import axios from "axios";

const privateInstance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: {
    Accept: "application/json",
  },
});

export default privateInstance;
