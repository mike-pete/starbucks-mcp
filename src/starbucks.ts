// const resp = await fetch(
// 	'https://www.starbucks.com/bff/locations?lat=37.7890183&lng=-122.3915063&place=94105',
// 	{
// 		headers: {
// 			'x-requested-with': 'XMLHttpRequest',
// 		},
// 		referrer: 'https://www.starbucks.com/store-locator?place=94105',
// 		body: null,
// 		method: 'GET',
// 		mode: 'cors',
// 		credentials: 'include',
// 	}
// )

import { z } from 'zod'

// console.log(await resp.json())

// https://app.starbucks.com/bff/ordering/menu
// https://app.starbucks.com/bff/ordering/2121255/iced

// const resp = await fetch('https://app.starbucks.com/bff/ordering/menu')
// console.log(await resp.json())

const product = z.object({
	name: z.string(),
	productNumber: z.number(),
	productType: z.string(),
	uri: z.string(),
})

const menu = z.object({
	name: z.string(),
	uri: z.string(),
	id: z.string(),
	products: z.array(product),
})

type Menu = z.infer<typeof menu> & {
	children: Menu[]
}

const menuSchema: z.ZodType<Menu> = menu.extend({
	children: z.lazy(() => menuSchema.array()),
})

export async function getMenuCategories() {
	const resp = await fetch('https://app.starbucks.com/bff/ordering/menu')
	const menus = z.array(menuSchema).parse((await resp.json())['menus'])

	const menusWithProducts: Pick<Menu, 'name' | 'id'>[] = []

	const dfs = (menus: Menu[]) => {
		for (const menu of menus) {
			const { products, children, name, id } = menu
			if (products.length > 0) {
				menusWithProducts.push({ name, id })
			}
			if (children.length > 0) {
				dfs(children)
			}
		}
	}

	dfs(menus)

	// console.log(JSON.stringify(menusWithProducts, null, 2))
    return menusWithProducts
}

export async function getCategory(categoryId: string){
    const resp = await fetch('https://app.starbucks.com/bff/ordering/menu')
	const menus = z.array(menuSchema).parse((await resp.json())['menus'])

	const dfs = (menus: Menu[]): Menu | null => {
		for (const menu of menus) {
			const { children, id } = menu
			if (id === categoryId) {
                return menu
			}
			if (children.length > 0) {
			    const result = dfs(children)
                if (result !== null){
                    return result
                }
			}
		}
        return null
	}

	return dfs(menus)
}

// getCategory('lemonade-refreshers').then(x => console.log(x))