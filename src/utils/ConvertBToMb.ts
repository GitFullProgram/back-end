export const ConvertBToMb = (size: number) => {
	return Number((size / 1024 / 1024).toFixed(1))
}
