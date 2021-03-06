import HeaderArticle from "./HeaderArticle";
import OGMetas from "./OGMetas";
import { useRouter } from "next/router";

export default function Article({ children, meta }) {
  const router = useRouter();
  return (
    <>
      <OGMetas
        title={meta.title}
        description={meta.description || ""}
        extraUrl={router.pathname}
      />
      <HeaderArticle meta={meta} />
      <article>{children}</article>
    </>
  );
}
