interface ResponseData {
    body: { isCustomer: boolean }
    digitalMessageException: string | null
    formName: string | null
    header: string | null
    isCustomer: false
    processId: string | null
    serviceName: string
    signature: string | null
    uuid: string
}

interface ApiResponse {
    status: number;
    data: ResponseData;
}

interface HandleResponseResult {
    status: number;
    data?: ResponseData;
    message?: string;
    response?: ApiResponse;
}

export const handleResponse = (response: ApiResponse): HandleResponseResult => {
    switch (response.status) {
        case 200:
            if (response?.status === 200) {
                return { status: 200, data: response?.data };
            }
        case 400:
            return { status: 400, message: response?.data.digitalMessageException ?? undefined, response }
        default:
            return { status: 500, message: "External Server Error", response }
    }
}