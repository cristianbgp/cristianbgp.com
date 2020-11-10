import Project from "../components/Project";
import { projects } from "../utils/getProjects";

export default function Projects() {
  return (
    <>
      <h1>Projects</h1>
      {projects.map((project) => (
        <Project key={project.url} project={project} />
      ))}
    </>
  );
}
