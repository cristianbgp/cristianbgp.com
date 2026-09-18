import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";
import SoundOrb from "./SoundOrb";
import { numaSamples } from "@/lib/numa-samples";

export default function NumaSoundGallery() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const selection = useRef<string | null>(null);
  const request = useRef(0);
  const wantsPlayback = useRef(false);
  const [active, setActive] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stop = () => {
      request.current++;
      wantsPlayback.current = false;
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
    };
    document.addEventListener("astro:before-swap", stop);
    return () => {
      document.removeEventListener("astro:before-swap", stop);
      stop();
    };
  }, []);

  async function toggle(sample: (typeof numaSamples)[number]) {
    const audio = audioRef.current;
    if (!audio) return;
    const attempt = ++request.current;
    if (selection.current === sample.id && wantsPlayback.current) {
      wantsPlayback.current = false;
      audio.pause();
      setPlaying(false);
      setLoading(false);
      return;
    }
    audio.pause();
    if (selection.current !== sample.id) audio.src = sample.audioUrl;
    selection.current = sample.id;
    wantsPlayback.current = true;
    setActive(sample.id);
    setPlaying(false);
    setLoading(true);
    setError("");
    try {
      await audio.play();
      if (request.current === attempt) {
        setPlaying(true);
        setLoading(false);
      }
    } catch {
      if (request.current === attempt) {
        wantsPlayback.current = false;
        setPlaying(false);
        setLoading(false);
        setError("This sound couldn't be played. Please try again.");
      }
    }
  }

  return (
    <section
      aria-label="Listen to thoughts from numa"
      className="not-prose my-8"
    >
      <p className="mb-5 text-center text-xs text-muted-foreground">
        Tap an orb to listen.
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {numaSamples.map((sample) => {
          const selected = active === sample.id;
          const engaged = selected && (playing || loading);
          return (
            <div
              key={sample.id}
              className="flex min-w-0 flex-col items-center gap-2"
            >
              <button
                type="button"
                onClick={() => void toggle(sample)}
                aria-label={`${engaged ? "Pause" : "Play"} sound: ${sample.thought}`}
                aria-pressed={engaged}
                aria-busy={selected && loading}
                className="group relative size-16 shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                <span
                  className={`block size-full ${selected && loading ? "sound-loading__orb" : ""}`}
                >
                  <SoundOrb
                    id={sample.id}
                    animated={selected && playing}
                    className="size-full motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-[1.02] motion-safe:group-active:scale-[0.98]"
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border border-border bg-background text-foreground">
                  {engaged ? (
                    <PauseIcon aria-hidden="true" className="size-3" />
                  ) : (
                    <PlayIcon aria-hidden="true" className="size-3" />
                  )}
                </span>
              </button>
              <span className="max-w-32 text-center text-xs leading-relaxed text-muted-foreground">
                {sample.thought}
              </span>
            </div>
          );
        })}
      </div>
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => {
          wantsPlayback.current = false;
          setPlaying(false);
          setLoading(false);
        }}
        onError={() => {
          request.current++;
          wantsPlayback.current = false;
          setPlaying(false);
          setLoading(false);
          setError("This sound couldn't be played. Please try again.");
        }}
      />
      <p
        role="status"
        className="mt-3 text-center text-xs text-muted-foreground"
      >
        {error || (loading ? "Loading sound…" : "")}
      </p>
    </section>
  );
}
