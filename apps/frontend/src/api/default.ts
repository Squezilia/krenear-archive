import axios from "axios";
import { configurationStore } from "../pinia";

const configuration = configurationStore();

const defaultApiInterface = axios.create({
  baseURL: configuration.apiURL,
});

export default defaultApiInterface;
