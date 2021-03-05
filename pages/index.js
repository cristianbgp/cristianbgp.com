import {
  GithubIcon,
  GmailIcon,
  LinkedinIcon,
  TwitterIcon,
} from "../components/icons";
import Link from "next/link";
import { styled } from "../stitches.config";

const Container = styled("div", {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
});

const Title = styled("h1", {
  fontSize: "44px",
  marginBottom: "0px",
  textAlign: "center",
});

const Subtitle = styled("p", {
  fontWeight: "300",
  fontSize: "32px",
  textAlign: "center",
});

const Icons = styled("div", {
  display: "flex",
});

const IconWrapper = styled("div", {
  marginLeft: "9px",
  "&:first-of-type": {
    marginLeft: "0px",
  },
});

export default function IndexPage() {
  return (
    <Container>
      <Title>Cristian Granda</Title>
      <Subtitle>Software Engineer / Game Designer</Subtitle>
      <Icons>
        <IconWrapper>
          <Link href="https://github.com/cristianbgp">
            <a target="_blank" rel="noreferrer">
              <GithubIcon width={32} height={32} />
            </a>
          </Link>
        </IconWrapper>
        <IconWrapper>
          <Link href="https://twitter.com/cristianbgp">
            <a target="_blank" rel="noreferrer">
              <TwitterIcon width={32} height={32} />
            </a>
          </Link>
        </IconWrapper>
        <IconWrapper>
          <Link href="https://www.linkedin.com/in/cristianbgp/">
            <a target="_blank" rel="noreferrer">
              <LinkedinIcon width={32} height={32} />
            </a>
          </Link>
        </IconWrapper>
        <IconWrapper>
          <Link href="mailto:cristian.granda.pastor@gmail.com">
            <a target="_blank" rel="noreferrer">
              <GmailIcon width={32} height={32} />
            </a>
          </Link>
        </IconWrapper>
      </Icons>
    </Container>
  );
}
