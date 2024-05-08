export function getIsValidUrl(url: string): boolean {
	const reg = new RegExp(/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/);
	return reg.test(url);
}
