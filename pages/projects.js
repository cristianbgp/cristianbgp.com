import OGMetas from "../components/OGMetas";
import Project from "../components/Project";
import { projects } from "../utils/getProjects";
import { styled } from "../stitches.config";

const Grid = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "3em",
});

export default function Projects() {
  return (
    <>
      <OGMetas
        title="Projects"
        description="Cristian Granda"
        extraUrl="/projects"
      />
      <h1>Projects</h1>
      <Grid>
        {projects.map((project) => (
          <Project key={project.url} project={project} />
        ))}
      </Grid>
    </>
  );
}
