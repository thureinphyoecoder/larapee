import axios from "axios";
window.axios = axios;

const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");

if (token) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
}

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const wsHost =
    import.meta.env.VITE_REVERB_HOST || window.location.hostname;
const wsPort = Number(import.meta.env.VITE_REVERB_PORT || 8080);
const isTls =
    (import.meta.env.VITE_REVERB_SCHEME ?? window.location.protocol.replace(":", "")) ===
    "https";

window.Echo = new Echo({
    broadcaster: "reverb", // ဒီနေရာမှာ Reverb လို့ ပြောလိုက်တာနဲ့ Pusher server ကို မသွားတော့ပါဘူး
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS: isTls,
    enabledTransports: ["ws", "wss"],
    authEndpoint: "/broadcasting/auth",
    auth: {
        headers: {
            "X-CSRF-TOKEN": token,
        },
    },
});

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
