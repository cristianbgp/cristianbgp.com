import { styled } from "../stitches.config";

const Div = styled("div", {
  boxShadow: "rgb(0 0 0 / 12%) 0px 2px 5px 0px",
  backgroundColor: "white",
  borderRadius: "5px",
  transition: "all 0.2s ease 0s",
  userSelect: "none",
  margin: "1.5em -2em 3em",
  padding: "1em 2em",
});

export default function Card({ children }) {
  return <Div>{children}</Div>;
}
