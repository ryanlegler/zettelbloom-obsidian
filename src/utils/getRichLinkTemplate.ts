import { Bookmark } from "types";
import { sanitizeFileName } from "./sanitizeFileName";
import { cleanText } from "./cleanText";
import { ZETTEL_MARK_SHORT_CODE } from "src/constants";

export function getRichLinkTemplate(bookmark: Bookmark) {
	const {
		description: descriptionRaw,
		title,
		image,
		source,
	} = bookmark || {};
	const resolvedTitle = sanitizeFileName(title);
	const description = cleanText(descriptionRaw);

	return `---
resource: website
title: ${resolvedTitle}
source: ${source}
description: ${description || ""}
image: ${image || ""}
---

${ZETTEL_MARK_SHORT_CODE}

`;
}
