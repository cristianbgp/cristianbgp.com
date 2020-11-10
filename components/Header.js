import Link from "next/link";

export default function Header() {
  return (
    <>
      <nav>
        <Link href="/">
          <a>Cristian Granda</a>
        </Link>
        <div>
          <Link href="/articles">
            <a>Articles</a>
          </Link>
          <Link href="/projects">
            <a>Projects</a>
          </Link>
          <Link href="/bookmarks">
            <a>Bookmarks</a>
          </Link>
          {/* <Link href="/uses">
            <a>Uses</a>
          </Link> */}
          <Link href="/cv">
            <a>CV</a>
          </Link>
        </div>
      </nav>
      <style jsx>{`
        nav {
          background: #fff;
          width: auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1rem;
          height: 61px;
          border-bottom: 1px solid #eaeaea;
          box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.12);
        }
        nav a {
          margin-right: 1rem;
          text-decoration: none;
        }
        nav a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
