import { writable } from "svelte/store";
import { ResponseToastEnum } from "$lib/enum";

export const PageTitle = writable("MariTanya");

export type toastType = {
    message: string[] | undefined;
    type: ResponseToastEnum | undefined;
};

let obj: toastType = {
    message: undefined,
    type: ResponseToastEnum.warning,
};

export const toastData = writable(obj);
