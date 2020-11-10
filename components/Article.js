import HeaderArticle from "./HeaderArticle";

export default function Article({ children, meta }) {
  return (
    <>
      <HeaderArticle meta={meta} />
      <article>{children}</article>
    </>
  );
}
