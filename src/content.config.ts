import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      published: z.boolean(),
      tags: z.array(z.string()),
      lang: z.string(),
      archived: z.boolean().optional(),
    }),
});

const tools = defineCollection({
  loader: glob({ base: "./src/content/tools", pattern: "**/*.{md,mdx}" }),
  schema: () =>
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      url: z.string(),
      date: z.coerce.date(),
    }),
});

export const collections = { articles, tools };
