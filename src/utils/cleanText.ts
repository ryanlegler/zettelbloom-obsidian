export function cleanText(text?: string) {
	return text
		? text
				.replace(/\s{3,}/g, " ")
				.replace(/:/g, "")
				.trim()
		: "";
}
