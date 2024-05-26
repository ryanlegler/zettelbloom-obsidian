import ZettelBloom from "main";
import { App, Notice, TFile } from "obsidian";
import { removeBookmarkFromFilePath } from "src/utils/removeBookmarkfromFilePath";

export async function purgeBookmark(plugin: ZettelBloom) {
	const { app } = plugin;
	const file = app.workspace.getActiveFile() as TFile;

	await removeBookmarkFromFilePath({ plugin, file });
}
