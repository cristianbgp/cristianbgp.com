import useSWR from "swr";
import fetcher from "../utils/fetcher";
import { styled } from "../stitches.config";
import { ChevronDownIcon, SpotifyIcon } from "./icons";
import { useReducer } from "react";

const Container = styled("div", {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "rgb(0 0 0 / 12%) 0px 2px 5px 0px",
  backgroundColor: "white",
  borderRadius: "5px",
  transition: "all 0.2s ease 0s",
  marginLeft: "1.5em",
  marginRight: "1.5em",
  marginTop: "12rem",
  "&:hover": {
    boxShadow: "rgb(199 199 199) 4px 4px 20px 6px",
  },
});

const Content = styled("div", {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  paddingTop: "1em",
  paddingBottom: "1em",
  width: 300,
  "@xs": {
    width: 300,
  },
  "@sm": {
    width: 400,
  },
});

const Body = styled("div", {
  display: "flex",
  flexDirection: "column",
});

const Artist = styled("p", {
  fontWeight: 400,
  margin: 0,
  textAlign: "center",
  wordBreak: "break-word",
  maxWidth: 150,
  "@xs": {
    maxWidth: 150,
  },
  "@sm": {
    maxWidth: 200,
  },
});

const SongTitle = styled("a", {
  fontWeight: 700,
  textAlign: "center",
  wordBreak: "break-word",
  maxWidth: 150,
  "@xs": {
    maxWidth: 150,
  },
  "@sm": {
    maxWidth: 200,
  },
});

const Image = styled("img", {
  transition: "all 1.0s ease-in-out 0s",
  width: 300,
  "@xs": {
    width: 300,
  },
  "@sm": {
    width: 400,
  },
});

const IconContainer = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "0.3rem",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out 0s",
});

export default function NowPlaying() {
  const { data } = useSWR("/api/now-playing", fetcher);
  const [showCoverImage, toggle] = useReducer((s) => !s, false);
  const isThereAnySong = data?.songUrl;

  return (
    <Container>
      <Content>
        <SpotifyIcon />
        <Body className="inline-flex flex-col sm:flex-row w-full max-w-full truncate">
          {isThereAnySong ? (
            <SongTitle
              href={data.songUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.title}
            </SongTitle>
          ) : (
            <SongTitle>Not Playing</SongTitle>
          )}
          <Artist>{data?.artist ?? "Spotify"}</Artist>
        </Body>
        {isThereAnySong ? (
          <IconContainer
            onClick={toggle}
            css={{
              transform: `rotateZ(${showCoverImage ? "0deg" : "-90deg"})`,
            }}
          >
            <ChevronDownIcon />
          </IconContainer>
        ) : (
          <div />
        )}
      </Content>
      {isThereAnySong && (
        <Image
          src={data?.albumImageUrl}
          css={{
            opacity: `${showCoverImage ? "1" : "0"}`,
            height: `${showCoverImage ? "unset" : "0"}`,
          }}
        />
      )}
    </Container>
  );
}
