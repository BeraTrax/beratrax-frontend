import { FC, useEffect } from "react";
import depositmodalbackspacecross from "src/assets/images/depositmodalbackspacecross.svg";

interface DialPadProps {
    inputValue: string; // The current value
    setInputValue: (value: string) => void; // Setter function for updating the value
    cursorPosition?: number | null; // Add cursor position prop
    onCursorPositionChange?: (position: number) => void; // Add callback for cursor position changes
    className?: string;
}

const DialPad: FC<DialPadProps> = ({
    inputValue,
    setInputValue,
    cursorPosition,
    onCursorPositionChange,
    className = "",
}) => {
    let backspaceTimeout: NodeJS.Timeout;

    const handleButtonClick = (value: string) => {
        if (value === "." && inputValue.includes(".")) return;

        if (cursorPosition !== null && cursorPosition !== undefined) {
            // Insert at cursor position
            const newValue = inputValue.slice(0, cursorPosition) + value + inputValue.slice(cursorPosition);
            setInputValue(newValue);
            onCursorPositionChange?.(cursorPosition + 1);
        } else {
            // Append to end
            setInputValue(inputValue + value);
        }
    };

    const handleBackspace = () => {
        if (cursorPosition !== null && cursorPosition !== undefined) {
            if (cursorPosition > 0) {
                // Delete character before cursor
                const newValue = inputValue.slice(0, cursorPosition - 1) + inputValue.slice(cursorPosition);
                setInputValue(newValue);
                onCursorPositionChange?.(cursorPosition - 1);
            }
        } else {
            // Default behavior: delete last character
            setInputValue(inputValue.slice(0, -1));
        }
    };

    const handleBackspaceHold = () => {
        backspaceTimeout = setTimeout(() => {
            setInputValue(""); // Clear all input after holding backspace
        }, 500); // 0.5s delay
    };

    const clearBackspaceTimeout = () => {
        clearTimeout(backspaceTimeout);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key.includes("F")) return;
        const validKeys = /[0-9.]/;
        if (validKeys.test(e.key)) {
            handleButtonClick(e.key); // Add the number or dot
        } else if (e.key === "Backspace") {
            handleBackspace(); // Handle single backspace
        }
    };

    useEffect(() => {
        if (window.innerWidth <= 768) {
            // Enable key listener only on mobile devices
            window.addEventListener("keydown", handleKeyPress);
        }
        return () => {
            if (window.innerWidth <= 768) {
                window.removeEventListener("keydown", handleKeyPress);
            }
        };
    }, [inputValue]);

    return (
        <div
            className={`${className} grid grid-cols-3 gap-4 gap-x-8 mt-4`}
            style={{ userSelect: "none", WebkitUserSelect: "none" }} // Disable text selection globally
        >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((num, index) => (
                <button
                    key={index}
                    onClick={() => (num === "⌫" ? handleBackspace() : handleButtonClick(num))}
                    onMouseDown={() => num === "⌫" && handleBackspaceHold()}
                    onMouseUp={clearBackspaceTimeout}
                    onMouseLeave={clearBackspaceTimeout}
                    onTouchStart={() => num === "⌫" && handleBackspaceHold()} // Mobile long press
                    onTouchEnd={clearBackspaceTimeout}
                    onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
                    className="w-full h-16 p-6 text-5xl font-bold flex items-center justify-center hover:bg-bgSecondary rounded-2xl"
                    style={{ userSelect: "none", WebkitUserSelect: "none" }} // Prevent text selection
                >
                    {num === "⌫" ? (
                        <img
                            src={depositmodalbackspacecross}
                            alt="del"
                            onContextMenu={(e) => e.preventDefault()} // Prevent image context menu
                            className="pointer-events-none"
                        />
                    ) : (
                        num
                    )}
                </button>
            ))}
        </div>
    );
};

export default DialPad;
