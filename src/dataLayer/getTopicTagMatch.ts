import { Bookmark } from "types";

type MetaData = {
	website: string;
	title: string;
	description: string | undefined;
	banner: string | undefined;
	themeColor: string | undefined;
};

export async function getTopicTagMatch(bookamrk: Bookmark, tagList: string[]) {
	// can get rid of this if I update the zettelbloom-api to take a Bookmark type
	const metadata: MetaData = {
		title: bookamrk.title,
		website: bookamrk.source,
		description: bookamrk.description,
		banner: bookamrk.image,
		themeColor: "",
	};
	const response = await fetch(
		`https://zettelbloom-api.vercel.app/api/getTopicTagMatch`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				metadata: metadata,
				tagList: tagList.map((tag) => tag.replace("🏷️ ", "")),
			}),
		}
	);

	const suggested = await response.json();
	return suggested;
}
