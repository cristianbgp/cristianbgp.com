import {
  GithubIcon,
  GmailIcon,
  LinkedinIcon,
  TwitterIcon,
} from "../components/icons";
import Link from "next/link";
import { styled } from "../stitches.config";
import OGMetas from "../components/OGMetas";
import NowPlaying from "../components/NowPlaying";

const Container = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const Title = styled("h1", {
  fontSize: "44px",
  marginBottom: "0px",
  textAlign: "center",
});

const Subtitle = styled("p", {
  fontWeight: "200",
  fontSize: "32px",
  textAlign: "center",
});

const Icons = styled("div", {
  display: "flex",
});

const IconWrapper = styled("div", {
  marginLeft: "20px",
  "&:first-of-type": {
    marginLeft: "0px",
  },
});

export default function IndexPage() {
  return (
    <Container>
      <OGMetas />
      <Title>Cristian Granda</Title>
      <Subtitle>Software Engineer / Game Designer</Subtitle>
      <Icons>
        <IconWrapper>
          <Link href="https://github.com/cristianbgp">
            <a rel="nofollow noopener noreferrer external" target="_blank">
              <GithubIcon width={32} height={32} />
            </a>
          </Link>
        </IconWrapper>
        <IconWrapper>
          <Link href="https://twitter.com/cristianbgp">
            <a rel="nofollow noopener noreferrer external" target="_blank">
              <TwitterIcon width={32} height={32} />
            </a>
          </Link>
        </IconWrapper>
        <IconWrapper>
          <Link href="https://www.linkedin.com/in/cristianbgp/">
            <a rel="nofollow noopener noreferrer external" target="_blank">
              <LinkedinIcon width={32} height={32} />
            </a>
          </Link>
        </IconWrapper>
        <IconWrapper>
          <Link href="mailto:cristian.granda.pastor@gmail.com">
            <a rel="nofollow noopener noreferrer external" target="_blank">
              <GmailIcon width={32} height={32} />
            </a>
          </Link>
        </IconWrapper>
      </Icons>
      <NowPlaying />
    </Container>
  );
}
