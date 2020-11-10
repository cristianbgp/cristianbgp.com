import Link from "next/link";
import format from "date-fns/format";

export default function ArticleSummary({ article }) {
  const {
    link,
    module: { meta },
  } = article;

  return (
    <>
      <article>
        <h2>
          <Link href={`/articles${link}`}>
            <a>{meta.title}</a>
          </Link>
        </h2>
        <div>
          <p>{meta.description}</p>
          <time>{format(new Date(meta.date), "MMMM dd, yyyy")}</time>
        </div>
      </article>
    </>
  );
}
