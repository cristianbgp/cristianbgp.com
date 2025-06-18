import Layout from "@/components/Layout";
import ResumeViewer from "@/components/ResumeViewer";

export default function Resume() {
  return (
    <Layout>
      <div className="relative py-10 z-10 min-h-svh pointer-events-auto w-full flex justify-center items-center flex-col">
        <p className="text-4xl font-bold pointer-events-auto">Resume</p>
        <ResumeViewer />
      </div>
    </Layout>
  );
}
