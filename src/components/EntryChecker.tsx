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
                    router.push("/register");
                    return;
                }

                try {
                    const accountsResp = await bankingService.getAccounts();
                    if (accountsResp && accountsResp.success && accountsResp.data && accountsResp.data.length > 0) {
                        router.push("/credit-assessment");
                        return;
                    }
                } catch (err) {
                    console.error("bankingService error", err);
                }

                router.push("/register");
            } catch (err) {
                console.error("EntryChecker error:", err);
            }
        })();
    }, [router]);

    return null;
}
