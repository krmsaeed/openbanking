export interface ApiResponse<T> {
    status: number;
    data?: unknown;
    response?: T;
}

export const handleResponse = <T>(response: ApiResponse<T>): ApiResponse<T> => {
    switch (response.status) {
        case 200:
            return { status: 200, data: response?.data };
        case 400:
            return { status: 400, data: response.data };
        case 500:
            return { status: 500, data: response.data };
        default:
            return { status: response.status, data: response.data };
    }
};
