export async function getMetaData(url: string) {
	const response = await fetch(
		`https://save-to-notion-gray.vercel.app/api/metadata?url=${url}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}
	);

	const result = await response.json();
	const { metadata } = result || {};

	return metadata;
}
