import { ZettelBloomSettings } from "types";
import { saveToRaindrop } from "./saveToRaindrop";

export async function backSync({
	url,
	settings,
}: {
	url: string;
	settings: ZettelBloomSettings;
}) {
	await saveToRaindrop({
		url,
		collectionID: settings.raindropCollectionID,
		token: settings.raindropToken,
	});
}
