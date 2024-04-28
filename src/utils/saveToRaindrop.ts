export async function saveToRaindrop({
	url,
	collectionID,
	token,
}: {
	url: string;
	collectionID: string;
	token: string;
}) {
	const bodyData = {
		link: url,
		pleaseParse: {},
		collection: {
			$id: collectionID,
		},
	};

	const result = await window.fetch(
		`https://api.raindrop.io/rest/v1/raindrop`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(bodyData),
		}
	);
	const data = await result.json();

	return data?.item;
}
