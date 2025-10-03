interface ApiResponse<T> {
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
        default:
            return { status: 500, response: 'External Server Error' as T };
    }
};
