import ZettelBloom from "main";

// Function to replace the selected text with "loading" and select it
export function replaceAndSelectLoading(plugin: ZettelBloom) {
	// const loadingString = "```zettelMarkLoading\n```";
	// const loadingStrings = Array(count).fill(loadingString).join("\n\n");
	const loadingString = " --// Loading... //-- ";

	const activeEditor = plugin.app.workspace.activeEditor?.editor;

	if (!activeEditor) return;

	// Replace the selected text with "loading"
	activeEditor.replaceSelection(loadingString);

	// Get the current cursor position
	const cursor = activeEditor.getCursor();
	const line = cursor.line;
	const ch = cursor.ch;

	// Calculate the start position of the newly inserted text
	const startPos = { line: line, ch: ch - loadingString.length };
	const endPos = { line: line, ch: ch };

	// Select the newly inserted text
	activeEditor.setSelection(startPos, endPos);
}
