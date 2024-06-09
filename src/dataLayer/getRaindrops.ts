import ZettelBloom from "main";
import { BASE_RAINDROP_URL } from "src/constants";
import { Item } from "types";

export async function getRaindrops(plugin: ZettelBloom) {
	const { settings } = plugin;
	// fetches the raindrop items
	const result = await window.fetch(
		`${BASE_RAINDROP_URL}/raindrops/${settings.raindropCollectionID}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${settings.raindropToken}`,
				"Content-Type": "application/json",
			},
		}
	);
	const data = await result.json();
	const { items }: { items: Item[] } = data || {};

	return items as Item[];
}
