export function FormFeedback({
    message,
    kind,
}: Readonly<{ message: string | null; kind: "success" | "error" }>) {
    if (!message) return null;

    const isSuccess = kind === "success";

    return (
        <div
            role="alert"
            className="rounded-md border p-3 text-sm"
            style={{
                backgroundColor: isSuccess ? "rgba(6,78,59,0.35)" : "rgba(127,29,29,0.38)",
                borderColor: isSuccess ? "rgba(16,185,129,0.45)" : "rgba(239,68,68,0.45)",
                color: isSuccess ? "#6ee7b7" : "#fecaca",
            }}
        >
            {message}
        </div>
    );
}

export function FieldError({ message }: Readonly<{ message?: string }>) {
    if (!message) return null;

    return (
        <p className="text-xs" style={{ color: "#fecaca" }}>
            {message}
        </p>
    );
}
