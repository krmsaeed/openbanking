'use client';
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
    nationalCode: '',
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
    nationalFile: undefined,
    processId: null,
    customerNumber: undefined,
    accountNumber: undefined,
};
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [userData, setUserDataState] = useState<UserData>(initialState);

    const setUserData = (data: Partial<UserData>) => {
        setUserDataState((prev) => ({ ...prev, ...data }));
    };

    const updateUserData = (key: keyof UserData, value: UserData[keyof UserData]) => {
        setUserDataState((prev) => ({ ...prev, [key]: value }));
    };

    const clearUserData = () => {
        setUserDataState(initialState);
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
