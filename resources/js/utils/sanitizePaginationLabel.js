export function sanitizePaginationLabel(label) {
    if (typeof label !== "string") {
        return "";
    }

    // Laravel paginator labels may contain small HTML fragments like "&laquo; Previous".
    // Strip tags and decode entities before rendering as plain text.
    const withoutTags = label.replace(/<[^>]*>/g, "");
    const parsed = new DOMParser().parseFromString(withoutTags, "text/html");
    return (parsed.documentElement.textContent || "").trim();
}
