import { getTagList } from "./getTagList";
import ZettelBloom from "main";

export function getIsTopicTagFile(plugin: ZettelBloom) {
	const file = plugin.app.workspace.getActiveFile();
	const title = file?.basename || "";
	const tagList = getTagList(plugin);
	return tagList.includes(title);
}
