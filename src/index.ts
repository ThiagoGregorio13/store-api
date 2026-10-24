import { Hono } from 'hono'

const app = new Hono()

const products = [
  { id: 1, title: 'product 1', price: 10, category: 'smartphones' },
  { id: 2, title: 'product 2', price: 20, category: 'smartphones' },
  { id: 3, title: 'product 3', price: 30, category: 'laptops' },
]

app.get('/products', (c) => {
  return c.json(products)
})

app.get('/products/:id', (c) => {
  const id = c.req.param('id')
  const product = products.find((p) => p.id === Number(id))

  if (!product) {
    return c.json({ message: 'Product not found' }, 404)
  }

  return c.json(product)
})

export default app
