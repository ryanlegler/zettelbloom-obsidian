import { ChooseTopicModal } from "src/ChooseTopicModal";
import { DEFAULT_SETTINGS } from "./src/constants";
import {
	App,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { MetaData, ZettelBloomSettings } from "types";

import { sync } from "src/utils/sync";

import "styles.css";
import { extractUrlFromMarkdown } from "src/utils/extractUrlFromMarkdown";
import { getMetaData } from "src/utils/getMetaData";
import { checkIfFileExists } from "src/utils/checkifFileExists";

export default class ZettelBloom extends Plugin {
	settings: ZettelBloomSettings;
	private timeoutIDAutoSync?: number;

	async onload() {
		await this.loadSettings();

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

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		this.addCommand({
			id: "sync-raindrop-io",
			name: "Sync Raindrop.io",
			callback: async () => {
				const selection =
					app.workspace.activeEditor?.editor?.getSelection();
				const url = extractUrlFromMarkdown(selection);
				const metadata: MetaData["metadata"] = await getMetaData(url);

				const { fileExists, newFileName } = checkIfFileExists({
					settings: this.settings,
					title: metadata.title,
					website: metadata.website,
					app: this.app,
				});
				if (fileExists) {
					new Notice(`🚨 File Already Exists: "${metadata.title}"`);
					// put the link in the current selection in the editor
					app.workspace.activeEditor?.editor?.replaceSelection(
						`![[${newFileName}]]`
					);

					return;
				} else {
					new ChooseTopicModal(
						this.app,
						this.settings,
						metadata
					).open();
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
			id: "options-modal",
			name: "Raindrop Sync Options Modal",
			callback: () => {
				new OptionsModal(this.app, this.settings).open();
			},
			hotkeys: [
				{
					modifiers: ["Meta", "Shift"],
					key: "R",
				},
			],
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);

		if (
			!this.settings.resourceFolderPath ||
			!this.settings.raindropToken ||
			!this.settings.raindropCollectionID
		) {
			new Notice(`MISSING CONFIG`);
			return;
		}

		this.app.workspace.onLayoutReady(async () => {
			let folderPath = this.settings.resourceFolderPath;
			console.log(
				"🚀 ~ ZettelBloom ~ this.app.workspace.onLayoutReady ~ folderPath:",
				folderPath
			);

			let folder = await this.app.vault.getAbstractFileByPath(folderPath);

			if (!folder) {
				new Notice(`Invalid Folder Path`);
				return;
			}
			if (this.settings.autoSyncInterval && this.settings.syncEnabled) {
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

	syncInPlace() {
		console.log("🚀 ~ syncInPlace ~ syncInPlace:");
		new Notice(`✅ syncInPlace...`);
		// This function will be called when the user clicks the ribbon icon
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

class OptionsModal extends Modal {
	settings: ZettelBloomSettings;

	constructor(app: App, settings: ZettelBloomSettings) {
		super(app);
		this.settings = settings;
	}

	async onOpen() {
		let { contentEl } = this;
		const wrapper = contentEl.createDiv();
		wrapper.setText("Command Palette");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
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
			.setName("Raindrop Integration Token")
			.setDesc(
				"Using Raindrop.io, create an Integration, copy the token and paste it here."
			)
			.addText((text) =>
				text
					.setPlaceholder("Add API Key here")
					.setValue(this.plugin.settings.raindropToken)
					.onChange(async (value) => {
						this.plugin.settings.raindropToken = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Collection")
			.setDesc(
				"Currently this plugin only supports one collection as a time. Add the Collection ID here."
			)
			.addText((text) =>
				text
					.setPlaceholder("Raindrop Collection ID")
					.setValue(this.plugin.settings.raindropCollectionID)
					.onChange(async (value) => {
						this.plugin.settings.raindropCollectionID = value;
						await this.plugin.saveSettings();
					})
			);
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

		// add a checkbox setting to turn on /off syncing
		new Setting(containerEl)
			.setName("Auto Sync Enabled")
			.addToggle((enabled) =>
				enabled
					.setValue(this.plugin.settings.syncEnabled)
					.onChange(async (value) => {
						this.plugin.settings.syncEnabled = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Sync Interval")
			.setDesc("Interval in minutes to sync Raindrop.io data")
			.addText((text) =>
				text
					.setPlaceholder("Sync Interval")
					.setValue(this.plugin.settings.autoSyncInterval)
					.onChange(async (value) => {
						this.plugin.settings.autoSyncInterval = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Back Sync Enabled")
			.setDesc(
				"When the Manual (In Place) Link Expansion, this will also sync the bookmark up to Raindrop.io"
			)
			.addToggle((enabled) =>
				enabled
					.setValue(this.plugin.settings.raindropBackSync)
					.onChange(async (value) => {
						this.plugin.settings.raindropBackSync = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Duplicate Prevention")
			.setDesc(
				"Prevents duplicate link resources from being created when iCloud Sync is lagging behind raindrop syncing, This is achieved by checking against an additional external data store. Metadata from the bookmark, and the collectionID is stored externally. See further details in the readme"
			)
			.addToggle((enabled) =>
				enabled
					.setValue(this.plugin.settings.duplicatePrevention)
					.onChange(async (value) => {
						this.plugin.settings.duplicatePrevention = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
