export function sanitizeUrl(title: string) {
	const forbiddenCharacters = ["/", "\\", ":", "*", "?", '"', "<", ">", "|"];
	const sanitizedTitle = title.replace(
		new RegExp("[" + forbiddenCharacters.join("") + "]", "g"),
		"_"
	);
	return sanitizedTitle;
}
