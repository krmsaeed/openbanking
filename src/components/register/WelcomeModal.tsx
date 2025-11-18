'use client';

import { Box, Typography } from '@/components/ui';
import { Button } from '@/components/ui/core/Button';
import { Modal } from '@/components/ui/overlay';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerNumber?: string;
    accountNumber?: string;
}

export function WelcomeModal({ isOpen, customerNumber, accountNumber }: WelcomeModalProps) {
    const { userData, setUserData } = useUser();
    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setUserData({ ...userData, step: 7 })}
            title="خوش آمدید!"
            closeOnClickOutside={false}
            size="lg"
            showCloseButton={false}
        >
            <Box className="space-y-6 text-center">
                <Box className="mx-auto flex h-24 w-24 items-center justify-center">
                    <Image
                        src="/icons/EnBankNewVerticalLogo_100x100 (1).png"
                        alt="بانک اقتصاد نوین"
                        width={96}
                        height={96}
                        className="rounded-md bg-gray-300 object-contain p-2"
                    />
                </Box>

                <Box className="space-y-4">
                    <Typography variant="h4" className="text-lg leading-relaxed font-semibold">
                        به خانواده بزرگ بانک اقتصاد نوین خوش آمدید
                    </Typography>

                    <Typography variant="p" className="text-md text-gray-800">
                        مشتری گرامی، با افتخار حضور ارزشمند شما را در بانک اقتصاد نوین خوشامد
                        می‌گوییم. از این پس، شما عضوی از خانواده‌ای هستید که هدف اصلی آن، ارائه
                        خدمات نوین، امن و شایسته به شماست.
                    </Typography>

                    <Box className="space-y-4">
                        <Box>
                            <Typography variant="p" className="font-semibold text-gray-800">
                                شماره مشتری
                            </Typography>
                            <Typography
                                variant="h5"
                                className="border-primary-200 mt-2 rounded-lg border-2 border-dashed bg-gray-50 p-3 text-lg font-bold"
                            >
                                {customerNumber && customerNumber}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="p" className="font-semibold text-gray-800">
                                شماره حساب
                            </Typography>
                            <Typography
                                variant="h5"
                                className="border-primary-300 mt-2 rounded-lg border-2 border-dashed bg-gray-50 p-3 font-bold"
                                dir="ltr"
                            >
                                {accountNumber && accountNumber}
                            </Typography>
                        </Box>
                    </Box>

                    <Typography variant="p" className="text-primary-700 text-lg font-bold">
                        ✨ بانک اقتصاد نوین؛ همسفر مطمئن شما در مسیر رشد و شکوفایی ✨
                    </Typography>
                </Box>

                <Box className="flex justify-center pt-4">
                    <Button
                        onClick={() => setUserData({ ...userData, step: 7 })}
                        variant="primary"
                        size="lg"
                        className="min-w-[15rem]"
                    >
                        ادامه
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
