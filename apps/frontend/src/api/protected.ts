import axios from "axios";
import { configurationStore, userStore } from "../pinia";

const configuration = configurationStore();
const user = userStore();

const createProtectedApiInterface = () => {
  return axios.create({
    baseURL: configuration.apiURL,
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });
};

export default createProtectedApiInterface;
