import { TypingText } from "@/components/animate-ui/text/typing";
import Layout from "@/components/Layout";
import { CommandKeyTrigger } from "@/components/AppCommand";
import SocialLinks from "@/components/SocialLinks";

export default function HomePage() {
  return (
    <Layout>
      <div className="relative z-10 h-full gap-4 pointer-events-none w-full flex justify-center items-center flex-col min-h-svh">
        <TypingText
          className="text-4xl font-bold pointer-events-auto"
          text={["Cristian Granda", "@cristianbgp"]}
          cursor
          loop
          cursorClassName="h-9"
          holdDelay={5000}
        />
        <SocialLinks />
        <CommandKeyTrigger />
      </div>
    </Layout>
  );
}
