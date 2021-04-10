import Head from "next/head";
import Header from "./Header";

export default function Layout({ children, description }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="Description" content={description} />
        <title key="title">Cristian Granda</title>
        <link rel="shortcut icon" href="/favicon.png" />
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
          font-size: 20px;
        }
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-weight: 700;
        }
        nav a {
          line-break: auto;
        }
        a {
          color: #000;
        }
        p a {
          line-break: anywhere;
        }
        p code {
          font-weight: 600;
          color: #272727;
          line-break: anywhere;
        }
        pre > code {
          font-weight: 300;
          font-size: 18px !important;
        }
        .content {
          max-width: 40em;
          margin: 4em auto;
          padding: 0 1em;
        }
      `}</style>
      <main>
        <Header />
        <div className="content">{children}</div>
      </main>
    </>
  );
}
