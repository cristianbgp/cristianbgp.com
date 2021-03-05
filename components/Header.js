import Link from "next/link";
import { styled } from "../stitches.config";

const HeaderContainer = styled("header", {
  background: "#fff",
  width: "auto",
  padding: "0 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "18px",
  height: "61px",
  borderBottom: "1px solid #eaeaea",
  boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.12)",
});

const Nav = styled("nav", {
  overflowX: "auto",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

const Anchor = styled("a", {
  marginRight: "1rem",
  textDecoration: "none",
  fontWeight: "300",
  "&:hover": {
    textDecoration: "underline",
    cursor: "pointer",
  },
});

const Title = styled("a", {
  marginRight: "1rem",
  textDecoration: "none",
  whiteSpace: "nowrap",
  "&:hover": {
    cursor: "pointer",
  },
});

export default function Header() {
  return (
    <HeaderContainer>
      <Link href="/">
        <Title>Cristian Granda</Title>
      </Link>
      <Nav>
        <Link href="/articles">
          <Anchor>Articles</Anchor>
        </Link>
        <Link href="/projects">
          <Anchor>Projects</Anchor>
        </Link>
        <Link href="/bookmarks">
          <Anchor>Bookmarks</Anchor>
        </Link>
        {/* <Link href="/uses">
            <Anchor>Uses</Anchor>
          </Link> */}
        <Link href="/cv">
          <Anchor>CV</Anchor>
        </Link>
      </Nav>
    </HeaderContainer>
  );
}
