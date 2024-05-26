export function cleanPermalink(url: string) {
	try {
		const urlObj = new URL(url);
		urlObj.search = "";
		urlObj.hash = "";
		return urlObj.toString().replace(/\/$/, "");
	} catch (e) {
		return;
	}
}
