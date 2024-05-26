import ZettelBloom from "main";
import { getIsValidUrl } from "./getIsValidUrl";
import { cleanPermalink } from "./cleanPermalink";

export async function saveResourceUrlCache({
	link,
	plugin,
}: {
	link: string;
	plugin: ZettelBloom;
}) {
	if (getIsValidUrl(link)) {
		const cleanLink = cleanPermalink(link) || "";
		const newCacheObject = {
			...{ [cleanLink]: new Date() },
			...plugin.settings.resourceUrlCache,
		};
		plugin.settings.resourceUrlCache = newCacheObject;
		await plugin.saveData(plugin.settings);
	}
}
