import Link from "next/link";
import { useRouter } from "next/router";
import { styled } from "../stitches.config";

const HeaderContainer = styled("header", {
  background: "#fff",
  width: "auto",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "18px",
  height: "61px",
  borderBottom: "1px solid #eaeaea",
  boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.12)",
  padding: "0 0 0 1rem",
  "@sm": {
    padding: "0 0 0 1rem",
  },
  "@md": {
    padding: "0 2rem",
  },
});

const HeaderWrapper = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1024px",
  height: "61px",
  marginLeft: "auto",
  marginRight: "auto",
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
  userSelect: "none",
  "&:hover": {
    textDecoration: "underline",
    cursor: "pointer",
  },
});

const Title = styled("a", {
  marginRight: "1rem",
  textDecoration: "none",
  whiteSpace: "nowrap",
  userSelect: "none",
  "&:hover": {
    cursor: "pointer",
  },
});

export default function Header() {
  const router = useRouter();
  return (
    <HeaderContainer>
      <HeaderWrapper>
        <Link href="/">
          <Title>Cristian Granda</Title>
        </Link>
        <Nav>
          {/* <Link href="/articles">
            <Anchor
              css={
                router.pathname === "/articles"
                  ? { fontWeight: "500" }
                  : undefined
              }
            >
              Articles
            </Anchor>
          </Link> */}
          <Link href="/projects">
            <Anchor
              css={
                router.pathname === "/projects"
                  ? { fontWeight: "500" }
                  : undefined
              }
            >
              Projects
            </Anchor>
          </Link>
          <Link href="/bookmarks">
            <Anchor
              css={
                router.pathname === "/bookmarks"
                  ? { fontWeight: "500" }
                  : undefined
              }
            >
              Bookmarks
            </Anchor>
          </Link>
          {/* <Link href="/uses">
            <Anchor
              css={
                router.pathname === "/uses" ? { fontWeight: "500" } : undefined
              }
            >
              Uses
            </Anchor>
          </Link> */}
          <Link href="/cv">
            <Anchor
              css={
                router.pathname === "/cv" ? { fontWeight: "500" } : undefined
              }
            >
              Resume
            </Anchor>
          </Link>
        </Nav>
      </HeaderWrapper>
    </HeaderContainer>
  );
}
