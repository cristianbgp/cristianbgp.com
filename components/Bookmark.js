import Link from "next/link";

export default function Bookmark({ bookmark }) {
  const { title, url, comment } = bookmark;

  return (
    <>
      <article>
        <h2>
          <Link href={url}>
            <a rel="nofollow noopener noreferrer external" target="_blank">
              {title}
            </a>
          </Link>
        </h2>
        <div>
          <p>{comment}</p>
        </div>
      </article>
    </>
  );
}
