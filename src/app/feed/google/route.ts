import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

function xml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function price(value: { toString(): string }) {
  const [whole, frac = ""] = value.toString().replace("-", "").split(".");
  return `${whole}.${(frac + "00").slice(0, 2)} TRY`;
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: {
      sku: true,
      slug: true,
      name: true,
      summary: true,
      description: true,
      price: true,
      stock: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  const items = products
    .map((product) => {
      const image = product.images[0]?.url;
      const description =
        product.summary || product.description || product.name;
      return `<item>
        <g:id>${xml(product.sku)}</g:id>
        <g:title>${xml(product.name)}</g:title>
        <g:description>${xml(description)}</g:description>
        <g:link>${xml(absoluteUrl(`/urun/${product.slug}`))}</g:link>
        ${image ? `<g:image_link>${xml(absoluteUrl(image))}</g:image_link>` : ""}
        <g:availability>${product.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
        <g:price>${price(product.price)}</g:price>
        <g:brand>Yanmersanhome</g:brand>
        <g:condition>new</g:condition>
      </item>`;
    })
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Yanmersanhome</title>
    <link>${xml(absoluteUrl("/"))}</link>
    <description>Yayındaki ürünler</description>
    ${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
