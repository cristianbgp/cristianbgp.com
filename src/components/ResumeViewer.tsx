import resumeData from "../lib/resume.json";
import { Button } from "./ui/button";

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default function ResumeViewer() {
  const { basics, work, education, skills, languages } = resumeData;
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-10">
      {/* Basics */}
      <section className="space-y-2">
        <p className="text-3xl font-bold">{basics.name}</p>
        <div className="text-lg text-muted-foreground">{basics.label}</div>
        <div className="flex flex-wrap gap-4 items-center mt-2">
          {basics.email && (
            <Button asChild variant="link">
              <a href={`mailto:${basics.email}`}>{basics.email}</a>
            </Button>
          )}
          {basics.website && (
            <Button asChild variant="link">
              <a
                href={basics.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {basics.website}
              </a>
            </Button>
          )}
        </div>
        <div className="text-base text-muted-foreground mt-2">
          {basics.summary}
        </div>
        {basics.profiles && basics.profiles.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-2">
            {basics.profiles.map((profile) => (
              <Button asChild variant="outline" size="sm" key={profile.network}>
                <a href={profile.url} target="_blank" rel="noopener noreferrer">
                  {profile.network}: @{profile.username}
                </a>
              </Button>
            ))}
          </div>
        )}
      </section>

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Skills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div key={skill.name} className="bg-muted rounded-md p-4">
                <div className="font-medium mb-1">{skill.name}</div>
                <div className="flex flex-wrap gap-2">
                  {skill.keywords?.map((kw) => (
                    <span
                      key={kw}
                      className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {work && work.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Experience</h2>
          <div className="space-y-6">
            {work.map((job, i) => (
              <div key={i} className="border-l-2 border-primary pl-4 relative">
                <div className="absolute -left-[7px] top-2 w-3 h-3 bg-primary rounded-full" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="font-medium text-base">
                    <a
                      href={job.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {job.company}
                    </a>
                    {" - "}
                    {job.position}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 sm:mt-0">
                    {formatDate(job.startDate)}
                    {job.endDate
                      ? ` - ${formatDate(job.endDate)}`
                      : " - Present"}
                  </div>
                </div>
                <div className="mt-2 whitespace-pre-line text-sm">
                  {job.summary}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Education</h2>
          <div className="space-y-4">
            {education.map((edu, i) => (
              <div key={i} className="bg-muted rounded-md p-4">
                <div className="font-medium">{edu.institution}</div>
                <div className="text-sm text-muted-foreground">
                  {edu.area} ({edu.studyType})
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Languages</h2>
          <div className="flex flex-wrap gap-4">
            {languages.map((lang) => (
              <div
                key={lang.language}
                className="bg-muted rounded-md px-3 py-1 text-sm"
              >
                {lang.language}{" "}
                <span className="text-muted-foreground">({lang.fluency})</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
