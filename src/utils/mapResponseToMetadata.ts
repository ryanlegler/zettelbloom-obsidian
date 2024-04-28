import { Item, MetaData, RainDropMeta } from "types";

export function mapResponseToMetadata(
	item: Item
): MetaData & { tags: string[] } & { raindropMeta: RainDropMeta } {
	return {
		metadata: {
			website: item.link,
			title: item.title,
			description: item.excerpt,
			banner: item.cover,
			themeColor: undefined,
		},
		socials: {},
		favicons: [],
		tags: item.tags,
		raindropMeta: {
			_id: item._id,
			link: item.link,
			title: item.title,
			excerpt: item.excerpt,
			cover: item.cover,
			tags: item.tags?.join(","),
			created: item.created,
			domain: item.domain,
			lastUpdate: item.lastUpdate,
			collectionId: item.collectionId,
			ingestedAt: new Date().toISOString(),
		},
	};
}
