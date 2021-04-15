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

const Time = styled("time", {
  fontWeight: "200",
});

const Description = styled("p", {
  fontWeight: "500",
  borderLeftWidth: "0.25rem",
  borderLeftColor: "#000",
  borderLeftStyle: "solid",
  paddingLeft: "1em",
});

export default function HeaderArticle({ meta }) {
  return (
    <>
      <h1>{meta.title}</h1>
      <MetaSection>
        {meta.description && <Description>{meta.description}</Description>}
        <Time>{format(new Date(meta.date), "MMMM dd, yyyy")}</Time>
      </MetaSection>
      {!meta.published && <DraftIndicator>Draft</DraftIndicator>}
    </>
  );
}
