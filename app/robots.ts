import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // O proxy já barra o acesso; isto evita que o painel e as rotas de dados
      // apareçam em busca.
      disallow: ["/admin", "/api/"],
    },
    sitemap: "https://baxijen.net.br/sitemap.xml",
  };
}
