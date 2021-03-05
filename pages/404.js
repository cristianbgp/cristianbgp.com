import Link from "next/link";
import { styled } from "../stitches.config";

const Anchor = styled("a", {
  marginRight: "1rem",
  textDecoration: "none",
  fontWeight: "300",
  "&:hover": {
    textDecoration: "underline",
    cursor: "pointer",
  },
});

export default function FourOhFour() {
  return (
    <>
      <h1>404</h1>
      <h2>
        Oh no{" "}
        <span role="img" aria-label="emoji-upside-down">
          🙃
        </span>
      </h2>
      <p>The page, article or slide you have tried to access was not found</p>
      <Link href="/">
        <Anchor>Go to Home</Anchor>
      </Link>
    </>
  );
}
