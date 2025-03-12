import { z } from 'zod'

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
	//https://app.starbucks.com/bff/ordering/menu
	const resp = await fetch('https://www.starbucks.com/apiproxy/v1/ordering/menu')
	const menus = z.array(menuSchema).parse((await resp.json())['menus'])
	console.log(resp)

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

    return menusWithProducts
}

export async function getCategory(categoryId: string){
	//https://app.starbucks.com/bff/ordering/menu
    const resp = await fetch('https://www.starbucks.com/apiproxy/v1/ordering/menu')
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