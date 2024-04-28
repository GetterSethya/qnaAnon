// See https://kit.svelte.dev/docs/types#app

import type { ResponseToastEnum } from "$lib/enum";

// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
    type ResponseToast = {
        error: boolean;
        message: string[];
        type: ResponseToastEnum;
    };
    var cacheDb: BetterSQLite3Database<typeof cacheSchema>;
}

export { };
