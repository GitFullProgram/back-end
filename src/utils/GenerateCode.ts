export const GenerateCode = () => {
	const chars = '0123456789'
	const codeLength = 6
	let code = ''
	for (let i = 0; i < codeLength; i++) {
		let randomNumber = Math.floor(Math.random() * chars.length)
		code += chars.substring(randomNumber, randomNumber + 1)
	}
	return Number(code)
}
