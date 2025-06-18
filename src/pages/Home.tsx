import { TypingText } from "@/components/animate-ui/text/typing";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

function App() {
  const [showCommandPrompt, setShowCommandPrompt] = useState(false);

  const getCommandKey = () => {
    const modifierKeyPrefix =
      navigator.userAgent.includes("Mac") ||
      navigator.userAgent.includes("iPhone") ||
      navigator.userAgent.includes("iPad")
        ? "⌘" // command key
        : "^"; // control key

    return modifierKeyPrefix;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCommandPrompt(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="relative z-10 h-full pointer-events-none w-full flex justify-center items-center flex-col min-h-svh">
        <TypingText
          className="text-4xl font-bold pointer-events-auto"
          text={["Cristian Granda", "@cristianbgp"]}
          cursor
          loop
          cursorClassName="h-9"
          holdDelay={5000}
        />
        <p
          className={cn(
            "text-muted-foreground text-sm transition-opacity duration-1000",
            showCommandPrompt ? "opacity-100" : "opacity-0"
          )}
          data-state={showCommandPrompt ? "show" : "hidden"}
        >
          Press{" "}
          <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
            <span className="text-xs">{getCommandKey()}</span>K
          </kbd>
        </p>
      </div>
    </Layout>
  );
}

export default App;
