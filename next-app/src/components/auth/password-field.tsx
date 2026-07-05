"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { FieldError } from "@/components/auth/form-feedback";

type PasswordFieldProps<T extends FieldValues> = Readonly<{
    id: Path<T>;
    label: string;
    placeholder: string;
    register: UseFormRegister<T>;
    error?: string;
    disabled?: boolean;
    autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
}>;

export function PasswordField<T extends FieldValues>({
    id,
    label,
    placeholder,
    register,
    error,
    disabled = false,
    autoComplete = "new-password",
}: PasswordFieldProps<T>) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm font-medium" style={{ color: "#fff6e9", opacity: 0.9 }}>
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    autoComplete={visible ? "off" : autoComplete}
                    placeholder={placeholder}
                    className="input-8bit w-full pr-11"
                    disabled={disabled}
                    {...register(id)}
                />
                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={visible}
                    disabled={disabled}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#9d4edd] transition-colors hover:text-[#c084fc] disabled:opacity-50"
                >
                    {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
            </div>
            <FieldError message={error} />
        </div>
    );
}
