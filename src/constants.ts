import { ZettelBloomSettings } from "types";

export const BASE_RAINDROP_URL = "https://api.raindrop.io/rest/v1";
export const BASE_RAINDROP_MIRROR_URL = "https://raindrop-sync.vercel.app/api";

export const DEFAULT_SETTINGS: ZettelBloomSettings = {
	mySetting: "default",
	autoSyncInterval: "5",
	syncEnabled: true,
	raindropToken: "",
	raindropCollectionID: "",
	resourceFolderPath: "",
	devTopicFolderPath: "",
	resourceInboxFilePath: "",
	devTopicUpLinkPath: "",
	raindropBackSync: true,
};
