import mergeClasses from "@/lib/utils";
import React, { ReactNode, MouseEventHandler } from "react";
import { Box } from "./Box";

type LegacyVariant = "body1" | "body2" | "caption" | "h6";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    className?: string;
    variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "subtitle1"
    | "subtitle2"
    | "p"
    | "span"
    | "LineWrapped"
    | LegacyVariant;
    onClick?: MouseEventHandler<HTMLElement>;
    color?: string;
    weight?: string | number;
    align?: "left" | "center" | "right" | "justify";
    as?: React.ElementType;
}


const Typography = ({ variant, children, className, onClick, color, weight, align, as }: TypographyProps) => {
    const v = variant || "p";

    const propClass = mergeClasses(
        color ? `text-${color}` : "",
        weight ? `font-${weight}` : "",
        align ? `text-${align}` : ""
    );

    const renderP = (extraClass = "") => (
        <p className={mergeClasses("text-base", extraClass, propClass, className)} onClick={onClick}>
            {children}
        </p>
    );

    const renderSpan = (extraClass = "") => (
        <span className={mergeClasses(extraClass, propClass, className)} onClick={onClick}>
            {children}
        </span>
    );

    const variantClass = (t: string) => {
        switch (t) {
            case "h1":
                return "text-6xl font-bold";
            case "h2":
                return "text-5xl font-bold";
            case "h3":
                return "text-4xl font-bold";
            case "h4":
                return "text-3xl font-bold";
            case "h5":
            case "h6":
                return "text-2xl font-bold";
            case "subtitle1":
                return "text-lg font-medium";
            case "subtitle2":
                return "text-base font-medium";
            case "body1":
                return "text-lg";
            case "body2":
                return "text-sm";
            case "caption":
                return "text-xs";
            case "p":
            default:
                return "text-base";
        }
    };
    const baseClass = variantClass(v);

    // If caller supplied `as`, render that element with the computed classes.
    if (as && v !== "LineWrapped") {
        // Render `as` as a safe inline element (span) to avoid accidentally creating
        // void/self-closing tags (like <input>) with children during SSR/prerender.
        return renderSpan(mergeClasses(baseClass, propClass));
    }

    switch (v) {
        case "h1":
            return (
                <h1 className={mergeClasses("text-6xl font-bold", propClass, className)} onClick={onClick}>
                    {children}
                </h1>
            );
        case "h2":
            return (
                <h2 className={mergeClasses("text-5xl font-bold", propClass, className)} onClick={onClick}>
                    {children}
                </h2>
            );
        case "h3":
            return (
                <h3 className={mergeClasses("text-4xl font-bold", propClass, className)} onClick={onClick}>
                    {children}
                </h3>
            );
        case "h4":
            return (
                <h4 className={mergeClasses("text-3xl font-bold", propClass, className)} onClick={onClick}>
                    {children}
                </h4>
            );
        case "h5":
        case "h6":
            return (
                <h5 className={mergeClasses("text-2xl font-bold", propClass, className)} onClick={onClick}>
                    {children}
                </h5>
            );
        case "subtitle1":
            return <h6 className={mergeClasses("text-lg font-medium", propClass, className)} onClick={onClick}>{children}</h6>;
        case "subtitle2":
            return <h6 className={mergeClasses("text-base font-medium", propClass, className)} onClick={onClick}>{children}</h6>;
        case "span":
            return renderSpan();
        case "LineWrapped":
            return (
                <Box className="flex w-full items-center justify-center gap-4">
                    <Box className="h-[1px] flex-1 bg-dark" />
                    {renderSpan("w-fit md:text-base")}
                    <Box className="h-[1px] flex-1 bg-dark" />
                </Box>
            );
        case "body1":
            return renderP("text-lg");
        case "body2":
            return renderP("text-sm");
        case "caption":
            return renderSpan("text-xs");
        case "p":
        default:
            return renderP();
    }
};

export default Typography;