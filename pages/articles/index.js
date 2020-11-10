import ArticleSummary from "../../components/ArticleSummary";
import { articles } from "../../utils/getAllArticles";

export default function IndexPage() {
  return (
    <>
      <h1>Articles</h1>
      {articles.map((article) => (
        <ArticleSummary key={article.link} article={article} />
      ))}
    </>
  );
}
