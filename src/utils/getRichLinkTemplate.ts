import { MetaData } from "types";
import { sanitizeFileName } from "./sanitizeFileName";
import { cleanText } from "./cleanText";

export function getRichLinkTemplate({
	metadata,
	tags,
	hashtag,
}: {
	metadata: MetaData["metadata"];
	tags: string[];
	hashtag?: string;
}) {
	const {
		description: descriptionRaw,
		title: titleRaw,
		website,
		banner,
	} = metadata || {};
	const title = sanitizeFileName(titleRaw);
	const image = banner;
	const description = cleanText(descriptionRaw);

	const isFavicon = image?.contains(".ico"); // TODO this could check for other common icon file names like "icon-512x512" or "favicon" etc.

	const resolvedHashtag = hashtag ? `\n${hashtag}` : "";
	const resolvedTags = tags?.length
		? `topicTags: \n${tags?.reduce(
				(acc, tag, index) =>
					acc +
					(index === 0
						? `- ${tag.replace(/,/g, "")}`
						: `\n- ${tag.replace(/,/g, "")}`),
				""
		  )}`
		: "topicTags:";

	return `---
resource: website
title: ${title}
source: ${website}
description: ${description || ""}
image: ${image || ""}
${resolvedTags}
---${resolvedHashtag}

<div class="rich-link-card-container"><a class="rich-link-card" href="${website}" target="_blank"> ${
		image
			? `<div class="rich-link-image-container ${
					isFavicon ? "image-is-favicon" : ""
			  }"><div
class="rich-link-image"
style="background-image: url('${image}')"
></div></div>`
			: ""
	} <div class="rich-link-card-text"><h1 class="rich-link-card-title">${title}</h1> ${
		description
			? `<p class="rich-link-card-description">${description}</p>`
			: ""
	} <p class="rich-link-href">${website}</p></div></a></div>
`;
}
