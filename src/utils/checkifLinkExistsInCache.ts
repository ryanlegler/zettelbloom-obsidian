import { ResourceUrlCache } from "types";
import { cleanPermalink } from "./cleanPermalink";

export function checkIfLinkExistsInCache({
	link,
	resourceUrlCache,
}: {
	link: string;
	resourceUrlCache: ResourceUrlCache;
}) {
	// Check if the link already exists in the cache
	const newLink = cleanPermalink(link);
	const linkAlreadySaved = newLink && resourceUrlCache?.[newLink];

	return linkAlreadySaved;
}
