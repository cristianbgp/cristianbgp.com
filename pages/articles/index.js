import ArticleSummary from "../../components/ArticleSummary";
import OGMetas from "../../components/OGMetas";
import { articles } from "../../utils/getAllArticles";

export default function IndexPage() {
  return (
    <>
      <OGMetas
        title="Articles"
        description="Cristian Granda"
        extraUrl="/articles"
      />
      <h1>Articles</h1>
      {articles.map((article) => (
        <ArticleSummary key={article.link} article={article} />
      ))}
    </>
  );
}
