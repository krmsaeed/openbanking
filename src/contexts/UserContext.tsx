'use client';
import {
    clearUserStateCookies,
    getCookie,
    getUserStateFromCookie,
    removeCookie,
    saveUserStateToCookie,
} from '@/lib/utils';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface UserData {
    step?: number;
    nationalCode?: string;
    phoneNumber?: string;
    birthDate?: string;
    postalCode?: string;
    password?: string;
    confirmPassword?: string;
    otp?: string;
    ENFirstName?: string;
    ENLastName?: string;
    certOtp?: string;
    selfie?: File;
    randomText?: string | null;
    video?: File;
    signature?: File;
    nationalCard?: File;
    branch?: string;
    nationalFile?: File;
    processId: number | null;
    customerNumber?: string;
    accountNumber?: string;
    isCustomer?: boolean;
    isDeposit?: boolean;
    hasScannedNationalCard?: boolean;
}

interface UserContextType {
    userData: UserData;
    setUserData: (data: Partial<UserData>) => void;
    updateUserData: (key: keyof UserData, value: UserData[keyof UserData]) => void;
    clearUserData: () => void;
}
const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

interface UserProviderProps {
    children: ReactNode;
}
const initialState: UserData = {
    step: 1,
    nationalCode: `${getCookie('national_id')}`,
    phoneNumber: '',
    birthDate: '',
    postalCode: '',
    password: '',
    confirmPassword: '',
    otp: '',
    certOtp: '',
    ENFirstName: '',
    ENLastName: '',
    randomText: null,
    selfie: undefined,
    video: undefined,
    signature: undefined,
    nationalCard: undefined,
    branch: '',
    isCustomer: getCookie('national_id') ? true : false,
    isDeposit: getCookie('national_id') ? true : false,
    nationalFile: undefined,
    processId: null,
    customerNumber: undefined,
    accountNumber: undefined,
    hasScannedNationalCard: false,
};
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [userData, setUserDataState] = useState<UserData>(() => {
        // بازیابی state از کوکی در initial load
        if (typeof window !== 'undefined') {
            const cookieState = getUserStateFromCookie();
            return {
                ...initialState,
                step: cookieState.step ?? initialState.step,
                processId: cookieState.processId ?? initialState.processId,
                isCustomer: cookieState.isCustomer ?? initialState.isCustomer,
                isDeposit: cookieState.isDeposit ?? initialState.isDeposit,
                randomText: cookieState.randomText ?? initialState.randomText,
            };
        }
        return initialState;
    });

    const setUserData = (data: Partial<UserData>) => {
        setUserDataState((prev) => {
            const newData = { ...prev, ...data };
            // ذخیره فیلدهای مهم در کوکی
            saveUserStateToCookie({
                step: newData.step,
                processId: newData.processId,
                isCustomer: newData.isCustomer,
                isDeposit: newData.isDeposit,
                randomText: newData.randomText,
            });
            return newData;
        });
    };

    const updateUserData = (key: keyof UserData, value: UserData[keyof UserData]) => {
        setUserDataState((prev) => {
            const newData = { ...prev, [key]: value };
            // ذخیره فیلدهای مهم در کوکی
            saveUserStateToCookie({
                step: newData.step,
                processId: newData.processId,
                isCustomer: newData.isCustomer,
                isDeposit: newData.isDeposit,
                randomText: newData.randomText,
            });
            return newData;
        });
    };

    const clearUserData = () => {
        setUserDataState(initialState);
        removeCookie(['access_token']);
        clearUserStateCookies();
    };

    return (
        <UserContext.Provider
            value={{
                userData,
                setUserData,
                updateUserData,
                clearUserData,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
