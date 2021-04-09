import Link from "next/link";
import { styled } from "../stitches.config";
import Card from "./Card";

const H2 = styled("h2", { margin: 0 });

const Description = styled("p", { margin: "1em 0" });

const Image = styled("img", {
  width: "100%",
  height: "200px",
  objectFit: "cover",
  borderRadius: "5px 5px 0px 0px",
  "&:hover": {
    objectFit: "contain",
  },
});

const Body = styled("div", {
  padding: "1em 2em",
});

export default function Project({ project }) {
  const { title, description, github, web, image } = project;

  return (
    <Card styles={{ margin: 0, padding: 0 }}>
      <Image src={image} alt={`${title}'s image`} />
      <Body>
        <H2>{title}</H2>
        <Description>{description}</Description>
        <div>
          {github && (
            <Link href={github}>
              <a rel="nofollow noopener noreferrer external" target="_blank">
                Github
              </a>
            </Link>
          )}
          {github && web && <span> - </span>}
          {web && (
            <Link href={web}>
              <a rel="nofollow noopener noreferrer external" target="_blank">
                Web
              </a>
            </Link>
          )}
        </div>
      </Body>
    </Card>
  );
}
