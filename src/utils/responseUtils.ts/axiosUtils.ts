import axios, { AxiosResponse } from "axios";
import https from "https";

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});
axios.defaults.httpsAgent = httpsAgent;

class AxiosUtils {
    static get(url: string): Promise<AxiosResponse> {
        return axios.get(url);
    }
}

export default AxiosUtils;
