import axios, { AxiosInstance } from 'axios';

const baseURL = process.env.BASE_URL;

export const httpClient: AxiosInstance = axios.create({
    baseURL: `${baseURL}/bpms`,
    timeout: 30000,
});

export default httpClient;
