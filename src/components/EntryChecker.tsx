"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { bankingService } from "@/services/banking";

export default function EntryChecker() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const params = new URLSearchParams(window.location.search);
            const nationalId = params.get("nationalId");
            const mobile = params.get("mobile");
            console.log("کد ملی:", nationalId, "شماره موبایل:", mobile);

            if (!nationalId) return;

            // validate national id centrally
            const { isValidNationalId, cleanNationalId } = await import('@/components/NationalIdValidator');
            const cleaned = cleanNationalId(nationalId);
            if (!isValidNationalId(cleaned)) {
                console.warn('invalid nationalId in EntryChecker, aborting');
                return;
            }


            try {
                // call registry-check API
                const res = await fetch("/api/registry-check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nationalId }),
                });

                const json = await res.json();

                if (!res.ok || !json.success) {
                    // not in registry -> go to registration/verification
                    router.push("/register");
                    return;
                }

                // registry says valid; try to detect existing bank accounts
                try {
                    const accountsResp = await bankingService.getAccounts();
                    if (accountsResp && accountsResp.success && accountsResp.data && accountsResp.data.length > 0) {
                        // user has accounts: consider them verified and redirect to credit assessment
                        router.push("/credit-assessment");
                        return;
                    }
                } catch (err) {
                    // if banking service fails, fall back to registration path
                    console.error("bankingService error", err);
                }

                // default: go to registration flow
                router.push("/register");
            } catch (err) {
                console.error("EntryChecker error:", err);
            }
        })();
    }, [router]);

    return null;
}
