import { BASE_RAINDROP_MIRROR_URL } from "src/constants";
import { MetaData, RainDropMeta, ZettelBloomSettings } from "types";
import { saveToRaindrop } from "./saveToRaindrop";

export async function backSync({
	url,
	settings,
	metadata,
}: {
	url: string;
	settings: ZettelBloomSettings;
	metadata: MetaData["metadata"];
}) {
	const { title } = metadata || {};
	const raindrop = await saveToRaindrop({
		url,
		collectionID: settings.raindropCollectionID,
		token: settings.raindropToken,
	});

	if (settings.duplicatePrevention) {
		const metadataMapped: Partial<RainDropMeta> = {
			link: url,
			title,
			cover: metadata?.banner,
			excerpt: metadata?.description,
			created: new Date().toISOString(),
			lastUpdate: new Date().toISOString(),
			tags: "",
			collectionId: parseInt(settings.raindropCollectionID, 10),
			_id: raindrop?._id,
		};
		// Adds it to turso Mirror if it doesn't exist
		await fetch(`${BASE_RAINDROP_MIRROR_URL}/raindrop`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(metadataMapped),
		});
	}
}
