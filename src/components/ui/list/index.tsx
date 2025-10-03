import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
type Element = {
    element?: "ol" | "ul";
};
type ListProps = (ComponentProps<"ol"> | ComponentProps<"ul">) & Element;
const List = (props: ListProps) => {
    const { element = "ul" } = props;
    if (element === "ul")
        return (
            <ul className={cn(props.className)} {...(props as ComponentProps<"ul">)}>
                {props.children}
            </ul>
        );
    else if (element === "ol")
        return (
            <ol className={cn(props.className)} {...(props as ComponentProps<"ol">)}>
                {props.children}
            </ol>
        );
};

export default List;