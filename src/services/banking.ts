import { apiClient, ApiResponse } from './api';

export interface BankAccount {
    id: string;
    accountNumber: string;
    accountType: 'savings' | 'current' | 'fixed';
    balance: number;
    currency: 'IRR' | 'USD' | 'EUR';
    status: 'active' | 'inactive' | 'blocked';
    createdAt: string;
}

export interface Transaction {
    id: string;
    accountId: string;
    amount: number;
    type: 'debit' | 'credit';
    description: string;
    referenceNumber: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

export interface TransferRequest {
    fromAccountId: string;
    toAccountNumber: string;
    amount: number;
    description?: string;
}

class BankingService {
    async getAccounts(): Promise<ApiResponse<BankAccount[]>> {
        return apiClient.get<BankAccount[]>('/banking/accounts');
    }

    async getAccount(accountId: string): Promise<ApiResponse<BankAccount>> {
        return apiClient.get<BankAccount>(`/banking/accounts/${accountId}`);
    }

    async getTransactions(
        accountId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<ApiResponse<{ transactions: Transaction[]; total: number; }>> {
        return apiClient.get(`/banking/accounts/${accountId}/transactions?page=${page}&limit=${limit}`);
    }

    async transfer(transferData: TransferRequest): Promise<ApiResponse<Transaction>> {
        return apiClient.post<Transaction>('/banking/transfer', transferData);
    }

    async getBalance(accountId: string): Promise<ApiResponse<{ balance: number; currency: string; }>> {
        return apiClient.get(`/banking/accounts/${accountId}/balance`);
    }

    async blockAccount(accountId: string, reason: string): Promise<ApiResponse<void>> {
        return apiClient.put(`/banking/accounts/${accountId}/block`, { reason });
    }

    async unblockAccount(accountId: string): Promise<ApiResponse<void>> {
        return apiClient.put(`/banking/accounts/${accountId}/unblock`);
    }
}

export const bankingService = new BankingService();
