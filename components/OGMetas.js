import Head from "next/head";

export default function OGMetas({
  title = "Cristian Granda",
  description = "Software Engineer - Game Designer",
  url = "https://cristianbgp.com/",
  extraUrl,
}) {
  const eTitle = encodeURIComponent(title);
  const eDescription = encodeURIComponent(description);
  const api = "https://i.microlink.io/";
  const cardUrl = `https://cards.microlink.io/?preset=contentz&title=${eTitle}&description=${eDescription}`;
  const image = `${api}${encodeURIComponent(cardUrl)}`;
  const completeUrl = extraUrl ? `${url.slice(0, -1)}${extraUrl}` : url;
  const pageTitle = extraUrl ? `${title} - Cristian Granda` : title;

  return (
    <Head>
      <meta property="og:type" content="website" key="og:type" />
      <meta property="og:title" content={title} key="og:title" />
      <meta
        property="og:description"
        content={description}
        key="og:description"
      />
      <meta property="og:image" content={image} key="og:image" />
      <meta property="og:image:alt" content={description} key="og:image:alt " />
      <meta property="og:url" content={completeUrl} key="og:url" />
      <meta property="og:site_name" content={title} key="og:site_name" />
      <meta property="og:locale" content="en" key="og:locale" />
      <meta
        name="twitter:card"
        content="summary_large_image"
        key="twitter:card"
      />
      <meta name="twitter:site" content="@cristianbgp" key="twitter:site" />
      <meta
        name="twitter:creator"
        content="@cristianbgp"
        key="twitter:creator"
      />
      <meta name="twitter:url" content={completeUrl} key="twitter:url" />
      <meta name="twitter:title" content={title} key="twitter:title" />
      <meta
        name="twitter:description"
        content={description}
        key="twitter:description"
      />
      <meta name="twitter:image" content={image} key="twitter:image" />
      <meta
        name="twitter:summary"
        content={description}
        key="twitter:summary"
      />
      <title key="title">{pageTitle}</title>
    </Head>
  );
}
