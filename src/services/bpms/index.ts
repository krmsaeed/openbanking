import { sendMessage } from './sendMessage';

export interface VirtualOpenDepositCustomerInfo {
    code: string;
    mobile?: string;
    birthDate?: string;
    postalCode?: string;
}
export async function virtualOpenDepositInit(code: string) {
    return sendMessage({ code });
}


export async function virtualOpenDepositGetCustomerInfo(payload: VirtualOpenDepositCustomerInfo, processId?: number) {

    if (typeof processId === 'number') {
        const axios = (await import('axios')).default;
        const baseUrl = process.env.BASE_URL || '';
        const resp = await axios.post(`${baseUrl}/bpms/sendMessage`, {
            serviceName: 'virtual-open-deposit',
            processId,
            body: payload,
        });
        return resp.data;
    }

    return sendMessage({ code: payload.code });
}

const bpms = {
    virtualOpenDepositInit,
    virtualOpenDepositGetCustomerInfo,
};

export default bpms;
