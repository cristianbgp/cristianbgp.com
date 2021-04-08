---
to: <%= absPath %>/<%= h.changeCase.paramCase(article_name) %>.mdx
---
import Article from "../../components/Article";

export const meta = {
  title: "<%= article_name %>",
  description: "<%= description %>",
  date: "<%= date %>",
  published: false,
};

export default ({ children }) => <Article meta={meta}>{children}</Article>;

Start writting ... 📝