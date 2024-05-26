import ZettelBloom from "main";
import { getIsValidUrl } from "./getIsValidUrl";
import { cleanPermalink } from "./cleanPermalink";

export async function removeResourceUrlCache({
	link,
	plugin,
}: {
	link: string;
	plugin: ZettelBloom;
}) {
	if (getIsValidUrl(link)) {
		const cleanLink = cleanPermalink(link) || "";
		const { [cleanLink]: _, ...rest } = plugin.settings.resourceUrlCache;
		plugin.settings.resourceUrlCache = rest;
		await plugin.saveData(plugin.settings);
	}
}
