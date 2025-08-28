"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PhoneIcon, ArrowRightIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";

export default function Login() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber) {
            alert("لطفاً شماره تلفن را وارد کنید");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setStep(2);
            setTimer(120);
            setCanResend(false);
            setLoading(false);
        }, 1500);
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 5) {
            alert("لطفاً کد ۵ رقمی را وارد کنید");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            router.push("/dashboard");
        }, 2000);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = otp.split("");
        newOtp[index] = value;
        setOtp(newOtp.join(""));

        if (value !== "" && index < 4) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const resendOtp = () => {
        setTimer(120);
        setCanResend(false);
        setOtp("");
        otpInputs.current[0]?.focus();
    };

    if (step === 1) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full">

                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                    >
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                        بازگشت
                    </Link>

                    <Card padding="lg">
                        <CardHeader>
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <PhoneIcon className="h-6 w-6 text-white" />
                            </div>

                            <CardTitle className="text-center">
                                ورود به حساب
                            </CardTitle>
                            <CardDescription className="text-center">
                                شماره تلفن همراه خود را وارد کنید
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handlePhoneSubmit} className="space-y-6">
                                <Input
                                    label="شماره تلفن همراه"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="09123456789"
                                    className="text-center"
                                    maxLength={11}
                                />

                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={loading || !phoneNumber}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <Loading size="sm" className="ml-2" />
                                    ) : null}
                                    دریافت کد تأیید
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full">

                <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="mb-8"
                >
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                    تغییر شماره
                </Button>

                <Card padding="lg">
                    <CardHeader>
                        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <PhoneIcon className="h-6 w-6 text-white" />
                        </div>

                        <CardTitle className="text-center">
                            کد تأیید
                        </CardTitle>
                        <CardDescription className="text-center">
                            کد ارسال شده به {phoneNumber} را وارد کنید
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                                    کد ۵ رقمی
                                </label>

                                <div className="otp-container flex justify-center space-x-3">
                                    {[...Array(5)].map((_, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => {
                                                otpInputs.current[index] = el;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            value={otp[index] || ""}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="otp-input w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            maxLength={1}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="text-center">
                                {timer > 0 ? (
                                    <div className="flex items-center justify-center text-gray-600">
                                        <ClockIcon className="w-4 h-4 ml-2" />
                                        <span>ارسال مجدد در {formatTime(timer)}</span>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={resendOtp}
                                    >
                                        ارسال مجدد کد
                                    </Button>
                                )}
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                disabled={loading || otp.length !== 5}
                                className="w-full"
                            >
                                {loading ? (
                                    <Loading size="sm" className="ml-2" />
                                ) : null}
                                تأیید و ورود
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}