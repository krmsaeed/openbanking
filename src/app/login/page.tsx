"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PhoneIcon, ClockIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/ui/specialized/PageHeader";
import { Button } from "@/components/ui/core/Button";
import { NationalCodeInput, PhoneNumberInput, OTPInput, type OTPInputRef } from "@/components/ui/forms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/core/Card";
import { Box, Typography } from "@/components/ui";
import { Label } from "@/components/ui/forms/Label";
import { Loading } from "@/components/ui/feedback/Loading";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, type LoginFormData } from "@/lib/schemas/common";

export default function Login() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    const otpInputs = useRef<(OTPInputRef | null)[]>([]);
    const { handleSubmit, control } = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
        mode: "onBlur",
    });
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

    const handlePhoneSubmit = async (data: LoginFormData) => {
        setLoading(true);
        
        if (data?.phoneNumber) setPhoneNumber(data.phoneNumber);
        setTimeout(() => {
            setStep(2);
            setTimer(120);
            setCanResend(false);
            setLoading(false);
        }, 500);
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 5) {
            toast.error("لطفاً کد ۵ رقمی را وارد کنید");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const randomOutcome = Math.random();
            if (randomOutcome < 0.3) {
                router.push("/not-eligible");
                toast.error("متأسفانه واجد شرایط دریافت تسهیلات نیستید");
            } else {
                router.push("/");
                toast.success("ورود موفقیت‌آمیز بود");
            }
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
            <PageHeader>
                <Card padding="none">
                    <CardHeader>
                        <Box className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <PhoneIcon className="h-6 w-6 text-white" />
                        </Box>

                        <CardTitle className="text-center">
                            ورود به حساب
                        </CardTitle>
                        <CardDescription className="text-center">
                            شماره تلفن همراه خود را وارد کنید
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(handlePhoneSubmit)} className="space-y-6">
                            <PhoneNumberInput control={control} />
                            <NationalCodeInput control={control} />
                            <Button
                                type="submit"
                                size="lg"
                                disabled={loading}
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
            </PageHeader>
        );
    }

    return (
        <PageHeader backText="تغییر شماره" onBack={() => setStep(1)}>
            <Card padding="none">
                <CardHeader>
                    <Box className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <PhoneIcon className="h-6 w-6 text-white" />

                    </Box>

                    <Typography variant="subtitle1" className="text-center">
                        کد تأیید
                    </Typography>
                    <Typography variant="body2" color="muted" className="text-center">
                        کد ارسال شده به {phoneNumber} را وارد کنید
                    </Typography>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <Box>
                            <Label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                                کد ۵ رقمی
                            </Label>

                            <Box className="otp-container flex justify-center space-x-3">
                                {[...Array(5)].map((_, index) => (
                                    <OTPInput
                                        key={index}
                                        ref={(el) => {
                                            otpInputs.current[index] = el;
                                        }}
                                        value={otp[index] || ""}
                                        onChange={(value) => handleOtpChange(index, value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="otp-input"
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Box className="text-center">
                            {timer > 0 ? (
                                <Box className="flex items-center justify-center text-gray-600">
                                    <ClockIcon className="w-4 h-4 ml-2" />
                                    <Typography as="span">ارسال مجدد در {formatTime(timer)}</Typography>
                                </Box>
                            ) : (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={resendOtp}
                                    disabled={!canResend}
                                >
                                    ارسال مجدد کد
                                </Button>
                            )}
                        </Box>

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
        </PageHeader>

    );
}