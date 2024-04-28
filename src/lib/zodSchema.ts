import { z } from "zod";

export const ZodQuestions = z
    .string({
        required_error: "Question is required",
        invalid_type_error: "Question must be type of string",
    })
    .min(1, { message: "Question must be at least 1 character long" })
    .max(500, {
        message: "Question is too long",
    });

export const ZodBio = z
    .string({
        invalid_type_error: "Bio must be a valid string",
    })
    .max(250, {
        message: "Bio can only have 250 characters",
    })
    .optional();
export const ZodFullname = z
    .string({
        required_error: "Full name is required",
        invalid_type_error: "Full name must be type of string",
    })
    .min(1, { message: "Full name cannot be empty" })
    .max(50, { message: "Full name cannot have more than 50 characters" });

export const ZodUsername = z
    .string({
        required_error: "Username is required",
        invalid_type_error: "Username must be type of string",
    })
    .min(8, { message: "Username must be at least 8 characters long" })
    .regex(/[a-zA-Z0-9]/g, {
        message: "Special characters are not allowed on username",
    })
    .max(25, { message: "Username cannot have more than 50 characters" });

export const ZodEmail = z
    .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be type of string",
    })
    .email({ message: "Invalid email" })
    .max(100, { message: "Email cannot have more than 100 characters" });

export const ZodPassword = (label: string) => {
    return z
        .string({
            required_error: `${label} is required`,
            invalid_type_error: `${label} must be type of string`,
        })
        .min(8, { message: `${label} must be at least 8 characters long` })
        .max(100, {
            message: `${label} cannot have more than 100 characters`,
        });
};
