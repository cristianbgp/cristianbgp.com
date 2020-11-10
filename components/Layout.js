import Head from "next/head";
import Header from "./Header";

export default function Layout({ children, pageTitle, description }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="Description" content={description}></meta>
        <title>{pageTitle}</title>
      </Head>
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          background: #fff;
          color: #000;
          font-size: 1rem;
        }
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-weight: 700;
        }
        a {
          color: #000;
        }
        .content {
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 1rem;
        }
      `}</style>
      <main>
        <Header />
        <div className="content">{children}</div>
      </main>
    </>
  );
}
