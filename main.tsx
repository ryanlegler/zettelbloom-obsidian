import { DEFAULT_SETTINGS } from "./src/constants";
import {
	App,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	WorkspaceLeaf,
	parseYaml,
} from "obsidian";
import { MetaData, ZettelBloomSettings } from "types";
import { sync } from "src/utils/sync";
import { ScriptModal } from "src/components/ScriptModal";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ZettelMark } from "src/components/ZettelMark";
import { inPlaceCommand } from "src/commands/inPlaceCommand";
import { ExampleView, VIEW_TYPE_EXAMPLE } from "src/view/exampleView";

import "styles.css";
import { removeBookmarkFromFilePath } from "src/utils/removeBookmarkfromFilePath";
import { TopicTagModal } from "src/components/TopicTagModal";
import { sanitizeFileName } from "src/utils/sanitizeFileName";
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
						plugin: this,
					});
				}
			);
			// Perform additional things with the ribbon
			ribbonIconEl.addClass("raindrop-sync-ribbon-class");
		}

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		this.registerView(
			VIEW_TYPE_EXAMPLE,
			(leaf) => new ExampleView(leaf, this.settings)
		);

		this.addRibbonIcon("dice", "Activate view", () => {
			this.activateView();
		});

		this.addCommand({
			id: "in-place-bookmark",
			name: "ZettelBloom In-Place Bookmark",
			callback: async () => {
				inPlaceCommand({
					plugin: this,
				});
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
				new ScriptModal(this).open();
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
				const isEmbedded =
					el.parentElement?.classList?.contains("cm-embed-block");

				const { fit } = parseYaml(_source) || {};

				const file = this.app.vault.getAbstractFileByPath(
					context.sourcePath
				) as TFile;
				const cache = this.app.metadataCache.getFileCache(file);

				const { title, source, description, image } =
					cache?.frontmatter || {};

				const metadata: MetaData["metadata"] = {
					title,
					website: source,
					description,
					banner: image,
					themeColor: "",
				};

				const handleDelete = async () => {
					if (
						window.confirm(
							"Are you sure you want to remove this bookmark?"
						)
					) {
						await removeBookmarkFromFilePath({
							plugin: this,
							file,
						});
					}
				};

				const handleAddTag = async () => {
					new TopicTagModal(this, file.basename, metadata).open();
					// open a dialog with the ability to to add a link to the current bookmark to any of the topic files
				};
				const backlinks = (
					this.app.metadataCache as any
				).getBacklinksForFile(file).data;

				const backlinksArray = Object.keys(backlinks);

				const filtered = backlinksArray
					.filter((link) => {
						return link.includes(this.settings.devTopicFolderPath);
					})
					.map((link) => {
						return link
							.split(this.settings.devTopicFolderPath)?.[1]
							?.replace("/", "")
							?.replace(".md", "");
					});

				const handleRemoveTag = async (tag: string) => {
					let devTopicFileName = `🏷️ ${sanitizeFileName(tag)}`;
					const devTopicPath = `${this.settings.devTopicFolderPath}/${devTopicFileName}.md`;

					let devTopicFile = app.vault.getAbstractFileByPath(
						devTopicPath
					) as TFile;

					const toReplace = `![[${file.basename}]]`;

					await this.app.vault
						.read(devTopicFile)
						.then((currentContent) => {
							this.app.vault.modify(
								devTopicFile,
								currentContent.replace(toReplace, "")
							);
						});
				};

				const root: Root = createRoot(el);
				root.render(
					<StrictMode>
						<ZettelMark
							isEmbedded={isEmbedded}
							handleRemoveTag={handleRemoveTag}
							onDelete={isEmbedded ? handleDelete : undefined}
							contain={fit ? true : false}
							title={title}
							source={source}
							description={description}
							image={image}
							tags={isEmbedded ? filtered : undefined}
							onAddTag={isEmbedded ? handleAddTag : undefined}
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

			// seed cache....
			// const files = this.app.vault.getMarkdownFiles();

			// const sourceLinks = files.reduce((acc, file) => {
			// 	if (file.path.startsWith(this.settings.resourceFolderPath)) {
			// 		const cache = app.metadataCache.getFileCache(file);
			// 		const url = cache?.frontmatter?.source; // assumes we are using the "topicTags" frontmatter for tags
			// 		if (url) {
			// 			acc.push(url);
			// 		}
			// 	}
			// 	return acc;
			// }, [] as string[]);

			// const cacheObject = sourceLinks.reduce((acc, link) => {
			// 	const newLink = cleanPermalink(link);
			// 	if (newLink) {
			// 		acc[newLink] = new Date();
			// 	}
			// 	return acc;
			// }, {} as Record<string, Date>);

			// const newCacheObject = {
			// 	...cacheObject,
			// 	...this.settings.resourceUrlCache,
			// };

			// this.settings.resourceUrlCache = newCacheObject;
			// await this.saveSettings();

			// seed cache end....

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

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

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
				sync({ settings: this.settings, app: this.app, plugin: this });
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
	}
}
