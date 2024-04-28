import { db } from "$lib/db/db";
import bcrypt from "bcrypt"
import { users } from "$lib/schema/schema";
import { ZodEmail, ZodFullname, ZodPassword, ZodUsername } from "$lib/zodSchema";
import { z } from "zod";
import { SALT } from "$env/static/private";
import { AuthError } from "$lib/helper";


export class ActionsRegisterHandler {
    private _registerSchema;
    private _formData;
    constructor(formData: FormData) {
        this._formData = formData
        this._registerSchema = z.object({
            fullName: ZodFullname,
            username: ZodUsername,
            email: ZodEmail,
            password: ZodPassword("Password"),
        });
    }

    get registerSchema() {
        return this._registerSchema
    }

    get formData() {
        return this._formData
    }

    set formData(v: FormData) {
        this._formData = v
    }


    parseRegisterForm() {
        const {
            inputName,
            inputEmail,
            inputUsername,
            inputPassword
        } = Object.fromEntries(this._formData) as Record<string, string>

        this._registerSchema.parse({
            fullName: inputName,
            username: inputUsername,
            email: inputEmail,
            password: inputPassword,
        });
    }

    async createNewUser() {
        const timestamp = new Date();
        const { inputName, inputEmail, inputUsername, inputPassword } = Object.fromEntries(this._formData) as Record<string, string>
        const hashedPassword = await bcrypt.hash(inputPassword + SALT, 10);
        await db
            .insert(users)
            .values({
                email: inputEmail,
                hashPassword: hashedPassword,
                name: inputName,
                username: inputUsername,
                updatedAt: timestamp,
                createdAt: timestamp,
            })
            .onConflictDoNothing();
    }

    confirmPassword() {
        const { inputPassword, inputConfirmPassword } = Object.fromEntries(this._formData) as Record<string, string>
        if (inputPassword !== inputConfirmPassword) {
            const authError = new AuthError("Password didnot match")
            throw authError
        }
    }

}
