import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import open from 'open'
import { getMenuCategories } from './starbucks'

const server = new McpServer({
	name: 'Starbucks',
	version: '0.0.1',
	// capabilities: {
	// 	tools: [
	// 		{
	// 			name: 'open_browser',
	// 			description: 'open browser',
	// 			parameters: {
	// 				type: 'object',
	// 				properties: {},
	// 				required: [],
	// 			},
	// 		},
	// 		{
	// 			name: 'greet',
	// 			description: 'greet',
	// 			parameters: {
	// 				type: 'object',
	// 				properties: {},
	// 				required: [],
	// 			},
	// 		},
	// 	],
	// 	resources: {
	// 		schemas: [
	// 			{
	// 				id: 'starbucks-menu',
	// 				uriScheme: 'menu',
	// 				description: 'Starbucks menu data',
	// 				variables: [],
	// 			},
	// 			{
	// 				id: 'echo',
	// 				uriScheme: 'echo',
	// 				description: 'Echo message resource',
	// 				variables: ['message'],
	// 			},
	// 		],
	// 	},
	// },
})

server.tool('open_browser', 'open browser', {}, async (): Promise<CallToolResult> => {
	await open('https://google.com')
	return {
		content: [
			{
				type: 'text',
				text: 'done',
			},
		],
	}
})

// 	const request = await fetch('https://app.starbucks.com/bff/ordering/menu')
// 	const menu = await request.json()

server.tool('get_menu_categories', 'get menu categories', {}, async (): Promise<CallToolResult> => {
	const menuCategories = await getMenuCategories()
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(menuCategories),
			},
		],
	}
})

async function main() {
	const transport = new StdioServerTransport()
	await server.connect(transport)
	console.error('MCP Server running on stdio')
}

main().catch((error) => {
	console.error('Fatal error in main():', error)
	process.exit(1)
})
