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
          <Link href={github}>
            <a>Github</a>
          </Link>

          {web && (
            <>
              <span> - </span>
              <Link href={web}>
                <a>Web</a>
              </Link>
            </>
          )}
        </div>
      </article>
    </>
  );
}
