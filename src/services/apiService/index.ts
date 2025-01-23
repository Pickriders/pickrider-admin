import { BASE_URL } from "@/constant";
import { AxiosError } from "axios";
import { getCookie } from "cookies-next";
import { Api } from "./Api";

type SecurityDataType = {
  token?: string;
};

type HeadersType = Record<
  keyof Omit<SecurityDataType, "token"> | "Authorization",
  string | undefined
>;

const apiService = new Api({
  baseURL: BASE_URL,
  timeout: 60000,
  timeoutErrorMessage: "Network error",
  securityWorker: async (securityData: SecurityDataType | null) => {
    const accessToken = getCookie("accessToken")?.toString();

    const auth = {
      access_token: accessToken,
    }; // TODO:  get auth from redux store
    const headers: HeadersType = {
      Authorization: `Bearer ${auth.access_token}`,
    };

    for (let key in securityData) {
      const typedKey = key as keyof SecurityDataType;
      if (typedKey === "token") {
        headers["Authorization"] = `Bearer ${securityData?.token}`;
      } else {
        headers[typedKey] = securityData[typedKey];
      }
    }

    return {
      headers: {
        ...headers,
      },
    };
  },
});

apiService.instance.interceptors.request.use(
  (config) => {
    console.log("apiService request =============>>", {
      headers: config.headers,
      url: config.url,
      data: config.data,
    });

    return config;
  },
  (err: AxiosError) => {
    console.log(
      "apiService request error =============>>",
      err.response?.data ?? err.message
    );
    return Promise.reject(err);
  }
);

apiService.instance.interceptors.response.use(
  (response) => {
    // logger.log("apiService response =============>>", response.data);
    return response;
  },
  (err: AxiosError) => {
    console.log(
      "apiService response error =============>>",
      err.response?.data ?? err.message
    );
    return Promise.reject(err);
  }
);

export { apiService };

export * from "./ApiRoute";
export * from "./data-contracts";
