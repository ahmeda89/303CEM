
"use strict"

const request = require('request')

exports.search = (request, callback) => {
	getBaseURL(request)
	if (request == undefined || request.params == undefined|| request.params.q == undefined) {
		console.log('undefined query')
		callback({code: 400, contentType: 'application/json', response: 'Missing Query Parameter'})
		return
	}
	apiCall(request.params.q, (err, data) => {
		if (err) {
			callback({code: 404, contentType: 'application/json', response: err})
		}
		if (data.items == undefined) {
			callback({code: 404, contentType: 'application/json', response: 'No Books Found'})
			return
		}
		//const test = (request.isSecure() ? 'https':'http')
		const protocol = request.headers['x-forwarded-proto'] || 'http'
		var results = data.items.map( item => {
			return {title: item.volumeInfo.title, link: protocol+'://'+request.headers.host+'/books/'+item.id}
		})
		callback({code: 200, contentType: 'application/json', response: results})
	})
}

var apiCall = (search, callback) => {
	let url = 'https://www.googleapis.com/books/v1/volumes?maxResults=40&fields=items(id,volumeInfo(title))&q='+search
	request.get(url, (err, res, body) => {
		if (err) {
			callback('failed to make API call')
		}
		const data = JSON.parse(body)
		callback(null, data)
	})
}

function getBaseURL(request) {
	console.log('x-forwarded-protocol: '+request.headers['x-forwarded-proto'])
	console.log('isSecure(): '+request.isSecure())
	let protocol = 'http'
	if(request.isSecure()) {
		protocol = 'https'
	}
	const test = (request.isSecure() ? 'https':'http')
	console.log('test: '+test)
	const url = protocol+'://'+request.headers.host
	return url
}