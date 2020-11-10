import format from "date-fns/format";

export default function HeaderArticle({ meta }) {
  return (
    <>
      <h1>{meta.title}</h1>
      <div>
        <p>{meta.description}</p>
        <time>{format(new Date(meta.date), "MMMM dd, yyyy")}</time>
      </div>
    </>
  );
}
