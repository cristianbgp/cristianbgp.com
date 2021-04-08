import Link from "next/link";

export default function Project({ project }) {
  const { title, description, github, web } = project;

  return (
    <>
      <article>
        <h2>
          <a>{title}</a>
        </h2>
        <div>
          <p>{description}</p>
        </div>
        <div>
          {github && (
            <Link href={github}>
              <a rel="nofollow noopener noreferrer external" target="_blank">
                Github
              </a>
            </Link>
          )}
          {github && web && <span> - </span>}
          {web && (
            <Link href={web}>
              <a rel="nofollow noopener noreferrer external" target="_blank">
                Web
              </a>
            </Link>
          )}
        </div>
      </article>
    </>
  );
}
