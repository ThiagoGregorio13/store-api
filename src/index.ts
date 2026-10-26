import { Hono } from "hono";
import { sql } from "bun";

const app = new Hono();

type ProductRow = {
  id: number;
  title: string;
  price: string;
  category: string;
};

const products = [
  { id: 1, title: "product 1", price: 10, category: "smartphones" },
  { id: 2, title: "product 2", price: 20, category: "smartphones" },
  { id: 3, title: "product 3", price: 30, category: "laptops" },
];

app.get("/products", async (c) => {
  const category = c.req.query("category");
  if (!category) {
    const rows: ProductRow[] = await sql`SELECT * FROM products`;
    const mapRows = rows.map((p) => ({ ...p, price: Number(p.price) }));
    return c.json(mapRows);
  }
  const filtered: ProductRow[] =
    await sql`SELECT * FROM products WHERE LOWER(category) = LOWER(${category})`;
  const mapFiltered = filtered.map((p) => ({ ...p, price: Number(p.price) }));
  return c.json(mapFiltered);
});

app.get("/products/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if(!Number.isInteger(id)){
    return c.json({message:"id must be an integer"}, 400)
  }
  const rows: ProductRow[] = await sql`SELECT * FROM products WHERE id = ${id}`;
  const product = rows[0];
  if (!product) {
    return c.json({ message: `Product with id ${id} not found` }, 404);
  }

  return c.json({ ...product, price: Number(product.price) });
});

app.post("/products", async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: "Body must be valid JSON" }, 400);
  }
  if (
    body === null ||
    typeof body !== "object" ||
    typeof body.title !== "string" ||
    typeof body.price !== "number" ||
    typeof body.category !== "string" ||
    body.title.trim() === ""
  ) {
    return c.json({ message: "Invalid input" }, 400);
  }
  if (body.price <= 0) {
    return c.json({ message: "Price must be a positive number" }, 400);
  }

  const rows: ProductRow[] = await sql`
    INSERT INTO products (title, price, category)
    VALUES (${body.title.trim()}, ${body.price}, ${body.category})
    RETURNING *
  `;
  const newProduct = rows[0];

  return c.json({ ...newProduct, price: Number(newProduct.price) }, 201);
});

export default app;
