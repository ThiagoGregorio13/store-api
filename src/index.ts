import { Hono } from 'hono'

const app = new Hono()

const products = [
  {id:1, title: 'product 1', price:10, category: 'smartphone'},
    {id:2, title: 'product 2', price:20, category: 'laptop'},
  {id:3, title: 'product 3', price:30, category: 'tablet'},
]

app.get('/products', (c) => {
return c.json(products)
})

export default app
