import Layout from "../components/Layout";
import "../prism-themes/prism-material-oceanic.css";

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
