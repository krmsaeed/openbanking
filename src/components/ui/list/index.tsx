import mergeClasses from "@/lib/utils";
import { ComponentProps } from "react";

const List = (props: ComponentProps<"ul">) => {
    return (
        <ul className={mergeClasses(props.className)} {...props}>
            {props.children}
        </ul>
    );
};

export default List;