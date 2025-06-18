import { TypingText } from "@/components/animate-ui/text/typing";
import { CommandKeyTrigger } from "@/components/AppCommand";
import Layout from "@/components/Layout";
import ResumeViewer from "@/components/ResumeViewer";

export default function ResumePage() {
  return (
    <Layout>
      <div className="relative py-10 z-10 min-h-svh pointer-events-auto w-full flex justify-center items-center flex-col">
        <TypingText text="Resume" className="text-4xl font-bold" cursor />
        <CommandKeyTrigger />
        <ResumeViewer />
      </div>
    </Layout>
  );
}
