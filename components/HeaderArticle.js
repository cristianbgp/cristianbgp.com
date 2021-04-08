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

const MetaSection = styled("div", {
  marginBottom: "1rem",
});

export default function HeaderArticle({ meta }) {
  return (
    <>
      <h1>{meta.title}</h1>
      <MetaSection>
        {meta.description && <p>{meta.description}</p>}
        <time>{format(new Date(meta.date), "MMMM dd, yyyy")}</time>
      </MetaSection>
      {!meta.published && <DraftIndicator>Draft</DraftIndicator>}
    </>
  );
}
