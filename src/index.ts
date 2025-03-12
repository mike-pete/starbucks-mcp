import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { getCategory, getMenuCategories } from './menu'

const server = new McpServer({
	name: 'Starbucks',
	version: '0.0.1',
})

// server.tool('open_browser', 'open browser', {}, async (): Promise<CallToolResult> => {
// 	await open('https://google.com')
// 	return {
// 		content: [
// 			{
// 				type: 'text',
// 				text: 'done',
// 			},
// 		],
// 	}
// })


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

server.tool(
	'get_menu_category',
	'get specific menu category',
	{ categoryId: z.string() },
	async ({categoryId}): Promise<CallToolResult> => {
		const category = await getCategory(categoryId)
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(category),
				},
			],
		}
	}
)

async function main() {
	const transport = new StdioServerTransport()
	await server.connect(transport)
	console.error('MCP Server running on stdio')
}

main().catch((error) => {
	console.error('Fatal error in main():', error)
	process.exit(1)
})
