import { ChooseTopicModal } from "./src/components/ChooseTopicModal";
import { DEFAULT_SETTINGS } from "./src/constants";
import {
	App,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
} from "obsidian";
import { MetaData, ZettelBloomSettings } from "types";

import { sync } from "src/utils/sync";

import "styles.css";
import { extractUrlFromMarkdown } from "src/utils/extractUrlFromMarkdown";
import { getMetaData } from "src/utils/getMetaData";
import { checkIfFileExists } from "src/utils/checkifFileExists";
import { ScriptModal } from "src/components/ScriptModal";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ZettelMark } from "src/components/ZettelMark";
import { getIsValidUrl } from "src/utils/getIsValidUrl";
import { getTopicTagSet } from "src/utils/getTopicTagSet";
import { createInPlace } from "src/utils/createInPlace";

export default class ZettelBloom extends Plugin {
	settings: ZettelBloomSettings;
	private timeoutIDAutoSync?: number;

	async onload() {
		await this.loadSettings();

		if (this.settings.raindropSync) {
			// This creates an icon in the left ribbon.
			const ribbonIconEl = this.addRibbonIcon(
				"cloud",
				"Raindrop Sync",
				(evt: MouseEvent) => {
					// Called when the user clicks the icon.
					sync({
						settings: this.settings,
						app: this.app,
						manualSync: true,
					});
				}
			);
			// Perform additional things with the ribbon
			ribbonIconEl.addClass("raindrop-sync-ribbon-class");
		}

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		this.addCommand({
			id: "in-place-bookmark",
			name: "ZettelBloom In-Place Bookmark",
			callback: async () => {
				const selection =
					app.workspace.activeEditor?.editor?.getSelection();

				const url = extractUrlFromMarkdown(selection);

				if (!url || !getIsValidUrl(url)) {
					new Notice(`🚨 No URL Found in Selection`);
					return;
				}
				const metadata: MetaData["metadata"] = await getMetaData(url);

				const { fileExists, newFileName } = checkIfFileExists({
					settings: this.settings,
					title: metadata.title,
					website: metadata.website,
					app: this.app,
				});

				const tagList = getTopicTagSet({
					files: this.app.vault.getMarkdownFiles(),
					resourceFolderPath: this.settings.resourceFolderPath,
				});

				if (fileExists) {
					new Notice(`🚨 File Already Exists: "${metadata.title}"`);
					// put the link in the current selection in the editor
					app.workspace.activeEditor?.editor?.replaceSelection(
						`![[${newFileName}]]`
					);

					return;
				} else {
					// TODO account for other emoji prefixes
					// get current file
					// use the title of the file as the tag - if it's one of the topic tags

					const file = app.workspace.getActiveFile();
					const title = file?.basename?.replace("🏷️ ", "") || "";
					const tags =
						(Array.from(tagList).includes(title) && [title]) || [];

					if (tags.length) {
						createInPlace({
							app: this.app,
							settings: this.settings,
							metadata,
							tags,
							propagate: false, // we don't want to propagate the link - we are already adding it in place and are in a topic tag page
						});
					} else {
						const { title } = metadata || {};
						const response = await fetch(
							`https://zettelbloom-api.vercel.app/api/getTopicTagMatch`,
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									metadata: metadata,
									tagList: Array.from(tagList),
								}),
							}
						);
						new Notice(`Fetched Topic Tags for ${title}`);

						const suggested = await response.json();

						new ChooseTopicModal({
							app: this.app,
							settings: this.settings,
							metadata,
							tagList: Array.from(tagList),
							suggested,
						}).open();
					}
				}
			},
			hotkeys: [
				{
					modifiers: ["Meta", "Shift"],
					key: "L",
				},
			],
		});

		this.addCommand({
			id: "command-palette-modal",
			name: "Command Palette Modal",
			callback: () => {
				new ScriptModal(this.app, this.settings).open();
			},
			hotkeys: [
				{
					modifiers: ["Meta", "Shift"],
					key: "R",
				},
			],
		});

		this.registerMarkdownCodeBlockProcessor(
			"zettelMark",
			(_source, el, context) => {
				const file = this.app.vault.getAbstractFileByPath(
					context.sourcePath
				);
				const cache = this.app.metadataCache.getFileCache(
					file as TFile
				);
				const { title, source, description, image, tags } =
					cache?.frontmatter || {};

				// _source will give us the content of the code block if we want it for some reason

				const root: Root = createRoot(el);
				root.render(
					<StrictMode>
						<ZettelMark
							title={title}
							source={source}
							description={description}
							image={image}
							tags={tags}
						/>
					</StrictMode>
				);
			}
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, "click", (evt: MouseEvent) => {
		// 	console.log("click", evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);

		if (
			this.settings.raindropSync &&
			(!this.settings.resourceFolderPath ||
				!this.settings.raindropToken ||
				!this.settings.raindropCollectionID)
		) {
			new Notice(`MISSING CONFIG`);
			return;
		}

		this.app.workspace.onLayoutReady(async () => {
			let folderPath = this.settings.resourceFolderPath;
			let folder = await this.app.vault.getAbstractFileByPath(folderPath);

			// const tags = getTopicTagSet({
			// 	files: this.app.vault.getMarkdownFiles(),
			// 	resourceFolderPath: folderPath,
			// });

			// const setAsString = JSON.stringify(Array.from(tags));
			// console.log(
			// 	"🚀 ~ ZettelBloom ~ this.app.workspace.onLayoutReady ~ setAsString:",
			// 	setAsString
			// );

			// Remove the unnecessary console.log statement

			if (!folder) {
				new Notice(`Invalid Folder Path`);
				return;
			}
			if (
				this.settings.autoSyncInterval &&
				this.settings.raindropSync &&
				this.settings.raindropAutoSync
			) {
				new Notice(`startAutoSync`);
				await this.startAutoSync();
			}
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async clearAutoSync(): Promise<void> {
		if (this.timeoutIDAutoSync) {
			window.clearTimeout(this.timeoutIDAutoSync);
			this.timeoutIDAutoSync = undefined;
		}
		console.info("Clearing auto sync...");
	}
	async startAutoSync(): Promise<void> {
		const minutesToSync = parseInt(this.settings.autoSyncInterval, 10);

		if (minutesToSync > 0) {
			this.timeoutIDAutoSync = window.setTimeout(() => {
				new Notice(`✅ SYNCING...`);
				sync({ settings: this.settings, app: this.app });
				this.startAutoSync();
			}, minutesToSync * 60000);
		}
	}
}

class SettingTab extends PluginSettingTab {
	plugin: ZettelBloom;

	constructor(app: App, plugin: ZettelBloom) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Resource Folder Path")
			.setDesc("Where the new note per link should be located")
			.addText((text) =>
				text
					.setPlaceholder("Folder Path")
					.setValue(this.plugin.settings.resourceFolderPath)
					.onChange(async (value) => {
						this.plugin.settings.resourceFolderPath = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Resource Inbox File Path")
			.setDesc(
				"The File new resources should be added to. Include the file extension"
			)
			.addText((text) =>
				text
					.setPlaceholder("Resource Inbox File Path")
					.setValue(this.plugin.settings.resourceInboxFilePath)
					.onChange(async (value) => {
						this.plugin.settings.resourceInboxFilePath = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Dev Topic Folder Path")
			.setDesc("The Folder Dev Topic Files should be located")
			.addText((text) =>
				text
					.setPlaceholder("Dev Topic Folder Path")
					.setValue(this.plugin.settings.devTopicFolderPath)
					.onChange(async (value) => {
						this.plugin.settings.devTopicFolderPath = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Dev Topic 'Uplink' Path")
			.setDesc(
				"Each Dev Topic File should have a link back to this file."
			)
			.addText((text) =>
				text
					.setPlaceholder("Dev Topic 'Uplink' Path")
					.setValue(this.plugin.settings.devTopicUpLinkPath)
					.onChange(async (value) => {
						this.plugin.settings.devTopicUpLinkPath = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Bookmark Emoji Prefix")
			.setDesc(
				"The Emoji that will be used to prefix the new note for a bookmark"
			)
			.addText((text) =>
				text
					.setPlaceholder("Emoji Prefix")
					.setValue(this.plugin.settings.resourceEmojiPrefix)
					.onChange(async (value) => {
						this.plugin.settings.resourceEmojiPrefix = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Raindrop Integration")
			.setDesc(
				"Sync Raindrop.io data to Obsidian. This will create a new note for each bookmark in the specified folder."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.raindropSync)
					.onChange(async (value) => {
						this.plugin.settings.raindropSync = value;
						await this.plugin.saveSettings();
						// reset the plugins settings
						this.display();
					})
			);

		new Setting(containerEl)
			.setName("Raindrop Integration Token")
			.setDesc(
				"Using Raindrop.io, create an Integration, copy the token and paste it here."
			)
			.setDisabled(!this.plugin.settings.raindropSync)
			.addText((text) =>
				text
					.setDisabled(!this.plugin.settings.raindropSync)
					.setPlaceholder("Add API Key here")
					.setValue(this.plugin.settings.raindropToken)
					.onChange(async (value) => {
						this.plugin.settings.raindropToken = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Raindrop Collection")
			.setDesc(
				"Currently this plugin only supports one collection as a time. Add the Collection ID here."
			)
			.setDisabled(!this.plugin.settings.raindropSync)
			.addText((text) =>
				text
					.setDisabled(!this.plugin.settings.raindropSync)
					.setPlaceholder("Raindrop Collection ID")
					.setValue(this.plugin.settings.raindropCollectionID)
					.onChange(async (value) => {
						this.plugin.settings.raindropCollectionID = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Raindrop Back Sync Enabled")
			.setDesc(
				"When the Manual (In Place) Link Expansion, this will also sync the bookmark up to Raindrop.io"
			)
			.setDisabled(!this.plugin.settings.raindropSync)
			.addToggle((toggle) =>
				toggle
					.setDisabled(!this.plugin.settings.raindropSync)
					.setValue(this.plugin.settings.raindropBackSync)
					.onChange(async (value) => {
						this.plugin.settings.raindropBackSync = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Raindrop Auto Sync Enabled")
			.setDisabled(!this.plugin.settings.raindropSync)
			.addToggle((toggle) =>
				toggle
					.setDisabled(!this.plugin.settings.raindropSync)
					.setValue(this.plugin.settings.raindropAutoSync)
					.onChange(async (value) => {
						this.plugin.settings.raindropAutoSync = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Raindrop Sync Interval")
			.setDesc("Interval in minutes to sync Raindrop.io data")
			.setDisabled(!this.plugin.settings.raindropSync)
			.addText((text) =>
				text
					.setDisabled(!this.plugin.settings.raindropSync)
					.setPlaceholder("Sync Interval")
					.setValue(this.plugin.settings.autoSyncInterval)
					.onChange(async (value) => {
						this.plugin.settings.autoSyncInterval = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Raindrop Duplicate Prevention")
			.setDesc(
				"Prevents duplicate link resources from being created when iCloud Sync is lagging behind raindrop syncing, This is achieved by checking against an additional external data store. Metadata from the bookmark, and the collectionID is stored externally. See further details in the readme"
			)
			.setDisabled(!this.plugin.settings.raindropSync)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.duplicatePrevention)
					.setDisabled(!this.plugin.settings.raindropSync)
					.onChange(async (value) => {
						this.plugin.settings.duplicatePrevention = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
