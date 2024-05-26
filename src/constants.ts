import { ZettelBloomSettings } from "types";

export const BASE_RAINDROP_URL = "https://api.raindrop.io/rest/v1";
export const BASE_RAINDROP_MIRROR_URL = "https://raindrop-sync.vercel.app/api";

export const TOPIC_TAG = "#propagate";

export const ZETTEL_MARK_SHORT_CODE = "```zettelMark\n```";
export const ZETTEL_MARK_EMOJI = "🔗";

export const DEFAULT_SETTINGS: ZettelBloomSettings = {
	raindropSync: true,
	raindropAutoSync: false,
	raindropCollectionID: "",
	raindropToken: "",
	raindropBackSync: true,
	autoSyncInterval: "5",
	resourceFolderPath: "",
	resourceInboxFilePath: "",
	devTopicFolderPath: "",
	devTopicUpLinkPath: "",
	resourceEmojiPrefix: ZETTEL_MARK_EMOJI,
	resourceUrlCache: {},
};
