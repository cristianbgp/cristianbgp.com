function importAll(r) {
  return r
    .keys()
    .map((fileName) => ({
      link: fileName.substr(1).replace(/.mdx$/, ""),
      module: r(fileName),
    }))
    .sort(
      (a, b) => new Date(b.module.meta.date) - new Date(a.module.meta.date)
    );
}

export const articles = importAll(
  require.context("../pages/articles/", true, /\.mdx$/)
);
