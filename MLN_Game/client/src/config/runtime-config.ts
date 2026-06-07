function normalizeBasePath(value: string | undefined) {
  if (!value || value === "/") {
    return "/";
  }

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

export const appBasePath = normalizeBasePath(import.meta.env.VITE_APP_BASE_PATH);
export const socketServerUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
