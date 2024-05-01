import chokidar from "chokidar";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();
const localPath = process.env.PATH_TO_PLUGIN;

const watcher = chokidar.watch("main.js", {
	persistent: true,
});

watcher.on("change", (path) => {
	fs.copy(path, `${localPath}/main.js`)
		.then(() =>
			console.log(`JS ${path} has been copied to destination directory`)
		)
		.catch((error) => console.error(`Error copying file: ${error}`));
});

const watcherCss = chokidar.watch("styles.css", {
	persistent: true,
});

watcherCss.on("change", (path) => {
	fs.copy(path, `${localPath}/styles.css`)
		.then(() =>
			console.log(
				`CSS File ${path} has been copied to destination directory`
			)
		)
		.catch((error) => console.error(`Error copying file: ${error}`));
});
