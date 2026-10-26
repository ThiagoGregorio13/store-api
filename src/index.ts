import { Hono } from "hono";
import { sql } from "bun";

const app = new Hono();

type ProductRow = { id: number; title: string; price: string; category: string };

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
  const filtered = products.filter(
    (p) => p.category.toLocaleLowerCase() === category.toLocaleLowerCase(),
  );
  return c.json(filtered);
});


app.get("/products/:id", (c) => {
  const id = c.req.param("id");
  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return c.json({ message: "Product not found" }, 404);
  }

  return c.json(product);
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
  if (typeof body.price !== "number" || body.price <= 0) {
    return c.json({ message: "Price must be a positive number" }, 400);
  }
  const newProduct = {
    id: products.length + 1,
    title: body.title,
    price: body.price,
    category: body.category,
  };
  products.push(newProduct);
  return c.json(newProduct, 201);
});

export default app;
