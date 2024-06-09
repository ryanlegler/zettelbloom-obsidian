import { sanitizeFileName } from "src/utils/sanitizeFileName";

import { Bookmark } from "types";

export async function getBookmarkFromUrl(url: string) {
	const response = await fetch(
		`https://zettelbloom-api.vercel.app/api/requestMetaData?url=${url}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}
	);

	const result = await response.json();
	const { metadata } = result || {};

	const bookmark = {
		title:
			sanitizeFileName(metadata.title) ||
			sanitizeFileName(metadata.description),
		source: metadata.website,
		description: metadata.description,
		image: metadata.banner,
		tags: [],
	};

	return bookmark as Bookmark;
}
