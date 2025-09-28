import mergeClasses from "@/lib/utils";
import Image from "next/image";
import { ComponentProps } from "react";

interface SectionProps extends ComponentProps<"section"> {
    className?: string;
    variant?: "primary" | "secondary" | "single" | undefined;
}

const Section = ({ children, className, variant }: SectionProps) => {
    if (variant === "primary") {
        return (
            <section
                className={mergeClasses(
                    "container relative mx-1 my-32 flex flex-col gap-10 overflow-hidden rounded-[30px] bg-gray-lightest p-4 !py-28  dark:bg-gray-dark lg:rounded-[50px] lg:p-9",
                    className,
                )}
            >
                <Image
                    src={"/images/Pasted image.png"}
                    width={800}
                    quality={100}
                    height={800}
                    alt="image"
                    className="absolute right-0 top-0 max-h-24 max-w-24 rounded-tr-[30px] sm:max-h-28 sm:max-w-24 sm:rounded-tr-[25px] lg:max-h-28 lg:max-w-28"
                />
                <Image
                    src={"/images/Pasted image (5).png"}
                    width={800}
                    height={800}
                    quality={100}
                    alt="image"
                    className="lg:max-h-38 lg:max-w-38 absolute bottom-0 left-0 max-h-24 max-w-24 rounded-bl-[30px] sm:max-h-28 sm:max-w-28 sm:rounded-bl-[25px]"
                />
                {children}
            </section>
        );
    }
    if (variant === "single") {
        return (
            <section
                className={mergeClasses(
                    "container relative mx-1 mt-32 flex w-[95%] flex-col gap-10 rounded-[30px] bg-gray-lightest p-4 dark:bg-gray-dark md:mt-40 md:w-full md:p-8 lg:rounded-[50px] lg:p-9",
                    className,
                )}
            >
                {children}
            </section>
        );
    }
    if (variant === "secondary") {
        return (
            <section
                className={mergeClasses(
                    "container relative mx-1 my-32 flex flex-col gap-10 rounded-[30px] border border-gray-light p-4 !py-32 dark:border-gray-900 md:p-8 lg:rounded-[50px] lg:p-9",
                    className,
                )}
            >
                {children}
            </section>
        );
    } else
        return (
            <section className={mergeClasses("container flex flex-col", className)}>
                {children}
            </section>
        );
};

export default Section;