import Link from "next/link";
import format from "date-fns/format";
import { styled } from "../stitches.config";

const DraftIndicator = styled("span", {
  background: "#000",
  color: "#fff",
  padding: "0.25rem 1rem",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "14px",
});

const A = styled("a", {
  marginRight: "1rem",
  "&:hover": {
    textDecoration: "underline",
    cursor: "pointer",
  },
});

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
            <A>{meta.title}</A>
          </Link>
          {!meta.published && <DraftIndicator>Draft</DraftIndicator>}
        </h2>
        <div>
          <p>{meta.description}</p>
          <time>{format(new Date(meta.date), "MMMM dd, yyyy")}</time>
        </div>
      </article>
    </>
  );
}
