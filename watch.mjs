import chokidar from "chokidar";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();
const localPath = process.env.PATH_TO_PLUGIN;

const watcher = chokidar.watch("main.js", {
	persistent: true,
});

watcher.on("change", (path) => {
	fs.copy(path, localPath)
		.then(() =>
			console.log(`File ${path} has been copied to destination directory`)
		)
		.catch((error) => console.error(`Error copying file: ${error}`));
});
