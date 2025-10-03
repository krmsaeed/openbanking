import { XCircleIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useRef, useState } from "react";
import { Box } from "../core";

// Props interface for the Autocomplete component
interface AutocompleteProps {
    label: string;
    id: string;
    options: string[];
    onSelect: (value: string) => void;
}

// Autocomplete component with label and suggestions
const Autocomplete: React.FC<AutocompleteProps> = ({
    label,
    id,
    options,
    onSelect,
}) => {
    const [inputValue, setInputValue] = useState(options[0] || "");
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);
        if (value) {
            const filtered = options.filter((option) =>
                option.toLowerCase().includes(value.toLowerCase()),
            );
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions(options);
        }
    };

    const handleFocus = () => {
        setFilteredOptions(options);
        setShowSuggestions(true);
    };

    const handleSelect = (value: string) => {
        setInputValue(value);
        setShowSuggestions(false);
        onSelect(value);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            containerRef.current &&
            !containerRef.current.contains(event.target as Node)
        ) {
            setShowSuggestions(false);
        }
    };

    const handleClear = () => {
        setInputValue("");
        onSelect("");
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <Box className="relative my-4" ref={containerRef}>
            <label
                htmlFor={id}
                className="mb-1 mr-2 block text-right text-sm font-medium text-gray-700"
            >
                {label}
            </label>
            <Box className="relative">
                {inputValue && (
                    <XCircleIcon
                        className="absolute left-2 top-1/2 w-[35px] -translate-y-1/2 transform cursor-pointer text-gray-400"
                        onClick={handleClear}
                    />
                )}
                <input
                    id={id}
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className="block w-full rounded-md border-gray-300 px-5 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                />
            </Box>
            {showSuggestions && (
                <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-gray-300 bg-white">
                    {filteredOptions.map((option, index) => (
                        <li
                            key={index}
                            onMouseDown={() => handleSelect(option)}
                            className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </Box>
    );
};

export default Autocomplete;