export function sanitizeFileName(input: string) {
	const trimAfterFirstPipe = input.split("|")?.[0].trim();
	const replacement = "";
	var illegalRe = /[\/\?<>\\:\*\|"]/g;
	var controlRe = /[\x00-\x1f\x80-\x9f]/g;
	var reservedRe = /^\.+$/;
	var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
	var windowsTrailingRe = /[\. ]+$/;

	return trimAfterFirstPipe
		.replace(/[':#|]/g, "")
		.trim()
		.replace(illegalRe, replacement)
		.replace(controlRe, replacement)
		.replace(reservedRe, replacement)
		.replace(windowsReservedRe, replacement)
		.replace(windowsTrailingRe, replacement);
}
