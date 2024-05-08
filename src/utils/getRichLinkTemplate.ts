import { MetaData } from "types";
import { sanitizeFileName } from "./sanitizeFileName";
import { cleanText } from "./cleanText";
import { ZETTEL_MARK_SHORT_CODE } from "src/constants";
import { getTopicTagYaml } from "./getTopicTagYaml";

// TODO - topicTags could be configurable...
// Maybe all the properties could have a custom mapping...

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

	const resolvedHashtag = hashtag ? `\n${hashtag}` : "";
	const resolvedTopicTagsYaml = getTopicTagYaml(tags);

	return `---
resource: website
title: ${title}
source: ${website}
description: ${description || ""}
image: ${image || ""}
${resolvedTopicTagsYaml}
---${resolvedHashtag}

${ZETTEL_MARK_SHORT_CODE}

`;
}
