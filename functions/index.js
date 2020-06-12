exports.handler = async (event, context) => {
	return {
		statusCode: 200,
		body: JSOIN.stringify({
			message: 'Hi there Tacos',
			event
		})
	}
}