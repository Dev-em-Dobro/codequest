"use client";

import type { KeyboardEvent, ReactNode } from "react";

type AuthFormShellProps = Readonly<{
    children: ReactNode;
    className?: string;
    onSubmit: () => void | Promise<void>;
}>;

export function AuthFormShell({ children, className, onSubmit }: AuthFormShellProps) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Enter" || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        event.preventDefault();
        void onSubmit();
    };

    return (
        <div role="form" className={className} onKeyDown={handleKeyDown}>
            {children}
        </div>
    );
}
