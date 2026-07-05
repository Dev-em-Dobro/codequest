import { z } from "zod";

const emailSchema = z
    .string()
    .trim()
    .min(1, "Digite seu e-mail")
    .max(254, "E-mail muito longo")
    .email("Digite um e-mail válido");

const passwordSchema = z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(128, "A senha deve ter no máximo 128 caracteres");

export const signInSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Informe sua senha").max(128, "Senha inválida"),
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Confirme sua senha"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "As senhas não coincidem",
    });

export const signUpEmailSchema = z.object({
    email: emailSchema,
});

export const signUpSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Nome deve ter pelo menos 2 caracteres")
            .max(80, "Nome deve ter no máximo 80 caracteres"),
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Confirme sua senha"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "As senhas não coincidem",
    });

export const profileUpdateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Informe seu nome antes de salvar.")
        .max(80, "Nome deve ter no máximo 80 caracteres"),
    description: z.string().trim().max(500, "Descrição muito longa").optional(),
    github: z.string().trim().max(200, "URL do GitHub muito longa").optional(),
    linkedin: z.string().trim().max(200, "URL do LinkedIn muito longa").optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
