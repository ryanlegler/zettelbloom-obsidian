const BLOCK_LIST = ["home"];

export function sanitizeFileName(input: string) {
	console.log("🚀 ~ sanitizeFileName ~ input:", input);
	if (!input) {
		return false;
	}
	const trimAfterFirstPipe = input.split("|")?.[0].trim();
	const replacement = "";
	const illegalRe = /[\/\?<>\\:\*\|"]/g;
	// eslint-disable-next-line no-control-regex
	const controlRe = /[\x00-\x1f\x80-\x9f]/g;
	const reservedRe = /^\.+$/;
	const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
	// eslint-disable-next-line no-useless-escape
	const windowsTrailingRe = /[\. ]+$/;

	const sanitized = trimAfterFirstPipe
		.replace(/[':#|]/g, "")
		.trim()
		.replace(illegalRe, replacement)
		.replace(controlRe, replacement)
		.replace(reservedRe, replacement)
		.replace(windowsReservedRe, replacement)
		.replace(windowsTrailingRe, replacement);

	if (BLOCK_LIST.includes(sanitized.toLowerCase())) {
		return false;
	} else {
		return sanitized;
	}
}
