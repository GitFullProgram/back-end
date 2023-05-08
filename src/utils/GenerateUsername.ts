export const GenerateUsername = (name: string, email: string) => {
	const str = name
		.toLowerCase()
		.replace(/ /g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '')
	const str2 = email
		.toLowerCase()
		.split('@')[0]
		.replace(/ /g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '')
	const str3 = email.toLocaleLowerCase().split('@')[1].split('.')[1]
	return `${str}_${str2}-${str3}`
}
