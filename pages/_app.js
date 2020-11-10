import Layout from "../components/Layout";

export default function App({ Component, pageProps }) {
  return (
    <Layout
      pageTitle="Cristian Granda"
      description="Software Engineer / Game Designer"
    >
      <Component {...pageProps} />
    </Layout>
  );
}
