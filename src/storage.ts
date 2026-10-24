export function safeSetStorage(key: string, data: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}


export function safeGetStorage(key: string, fallback: any): any {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (err) {
    return fallback;
  }
}
