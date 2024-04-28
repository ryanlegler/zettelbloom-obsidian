export type ZettelBloomSettings = {
	mySetting: string;
	autoSyncInterval: string; // minutes
	syncEnabled: boolean;
	token: string;
	collectionID: string;
	resourceFolderPath: string;
	resourceInboxFilePath: string;
	devTopicFolderPath: string;
	devTopicUpLinkPath: string;
};

export type RainDropMeta = {
	_id: number;
	link: string;
	title: string;
	excerpt: string;
	cover: string;
	tags: string;
	created: string;
	lastUpdate: string;
	domain: string;
	collectionId: number;
	ingestedAt: string;
};
export type Item = {
	_id: number;
	link: string;
	title: string;
	excerpt: string;
	note: string;
	type: string;
	user: {
		$ref: string;
		$id: number;
	};
	cover: string;
	media: {
		link: string;
		type: string;
	}[];
	tags: string[];
	highlights: string[];
	important: boolean;
	removed: boolean;
	created: string;
	collection: {
		$ref: string;
		$id: number;
		oid: number;
	};
	lastUpdate: string;
	domain: string;
	creatorRef: {
		_id: number;
		avatar: string;
		name: string;
		email: string;
	};
	sort: number;
	collectionId: number;
};

export type MetaData = {
	metadata: {
		website: string;
		title: string;
		description: string | undefined;
		banner: string | undefined;
		themeColor: string | undefined;
	};
	socials: Record<string, string | undefined>;
	favicons: string[];
};
