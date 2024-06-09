import ZettelBloom from "main";
import { TFile } from "obsidian";

export function addBookmarkToInbox({
	plugin,
	fileName,
}: {
	plugin: ZettelBloom;
	fileName: string;
}) {
	const { settings, app } = plugin;

	// check to see if we are in the bookmark inbox
	const inboxFile = app.vault.getAbstractFileByPath(
		settings.resourceInboxFilePath
	) as TFile;

	const file = app.workspace.getActiveFile();
	const inboxIsActive = inboxFile.path === file?.path;

	// does the inbox file contents already contain the bookmark, if so then return
	app.vault.read(inboxFile).then((currentContent) => {
		if (currentContent.includes(`![[${fileName}]]`)) {
			return;
		}
	});

	// if not then also add to the inbox
	if (!inboxIsActive) {
		app.vault.read(inboxFile).then((currentContent) => {
			app.vault.modify(
				inboxFile,
				currentContent + `![[${fileName}]] \n \n`
			);
		});
	}
}
