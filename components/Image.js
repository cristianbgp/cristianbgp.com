import { styled } from "../stitches.config";
import Card from "./Card";

const Img = styled("img", {
  maxWidth: "100%",
  verticalAlign: "top",
});

const Figure = styled("figure", {
  textAlign: "center",
  margin: "0",
  width: "100%",
});

const Figcaption = styled("figcaption", {
  fontSize: "0.8em",
  textAlign: "center",
  marginTop: "1em",
  color: "rgba(0,0,0,0.7)",
});

export default function Image(props) {
  return (
    <Card>
      <Figure>
        <Img alt={props.alt} src={props.src} {...props} />
        {props.alt && <Figcaption>{props.alt}</Figcaption>}
      </Figure>
    </Card>
  );
}
