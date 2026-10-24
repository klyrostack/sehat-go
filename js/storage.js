export function safeSetStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    }
    catch (err) {
        return false;
    }
}
export function safeGetStorage(key, fallback) {
    try {
        const rawValue = localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallback;
    }
    catch (err) {
        return fallback;
    }
}
