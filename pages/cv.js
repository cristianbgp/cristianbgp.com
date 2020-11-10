import format from "date-fns/format";
import { Fragment } from "react";
import { styled } from "../stitches.config";
import { resume } from "../utils/getResume";

export default function CV() {
  return (
    <>
      <Basics {...resume.basics} />
      {resume.skills && <Skills skills={resume.skills} />}
      {resume.work && <WorkExperience experiencies={resume.work} />}
      {resume.languages && <Languages languages={resume.languages} />}
    </>
  );
}

const Space = styled("div", {
  display: "inline-block",
  variants: {
    size: {
      small: {
        width: "1rem",
      },
      medium: {
        width: "2rem",
      },
    },
  },
});

Space.defaultProps = {
  size: "medium",
};

const Line = styled("div", {
  width: "3px",
  height: "100%",
  background: "black",
  marginLeft: "3px",
  gridArea: "line",
});

const Dot = styled("div", {
  width: "10px",
  height: "10px",
  background: "black",
  borderRadius: "50%",
  gridArea: "dot",
});

const Section = styled("section", {
  mb: "3rem",
});

const H1 = styled("h1", {
  mb: "0px",
});

const A = styled("a", {
  display: "inline-block",
  marginBottom: "10px",
});

const NetworksContainer = styled("div", { display: "flex", flexWrap: "wrap" });

const NetworkContainer = styled("div", { display: "flex", padding: ".5em 0" });

const Blockquote = styled("blockquote", {
  borderLeft: "3px solid black",
  paddingLeft: "calc(2em - 3px)",
  ml: "0px",
  mr: "0px",
  fontWeight: "normal",
});

function Basics({ name, email, phone, website, summary, profiles }) {
  return (
    <Section id="basics">
      {name && <H1>{name}</H1>}
      <div>
        {email && (
          <A href={`mailto:${email}`} title="Email address">
            {email}
          </A>
        )}
        <Space />
        {phone && (
          <A href={`tel:${phone}`} title="Phone number">
            {phone}
          </A>
        )}
        <Space />
        {website && (
          <A href={website} title="Personal website">
            {website}
          </A>
        )}
      </div>
      {summary && <Blockquote>{summary}</Blockquote>}
      {profiles && (
        <NetworksContainer>
          {profiles.map((profile) => (
            <Fragment key={profile.network}>
              <NetworkContainer>
                <strong>{profile.network}</strong>
                <Space size="small" />
                <a href={profile.url} title={profile.network}>
                  @{profile.username}
                </a>
              </NetworkContainer>
              <Space />
            </Fragment>
          ))}
        </NetworksContainer>
      )}
    </Section>
  );
}

const KeywordsContainer = styled("div", {
  display: "flex",
  flexWrap: "wrap",
});

const Small = styled("small", {
  fontWeight: 300,
  fontSize: "0.8em",
});

function Skills({ skills }) {
  if (skills.length === 0) return null;

  return (
    <Section id="section-skills">
      <h3>Skills</h3>
      <div>
        {skills.map((skill) => (
          <article key={skill.name}>
            <h6>{skill.name}</h6>
            <KeywordsContainer>
              {skill.keywords &&
                skill.keywords.map((keyword) => (
                  <Small key={JSON.stringify(keyword)}>
                    {keyword}
                    <Space size="small" />
                  </Small>
                ))}
            </KeywordsContainer>
          </article>
        ))}
      </div>
    </Section>
  );
}

const H4 = styled("h4", {
  margin: "1em 0",
});

const ExperienceContainer = styled("div", {
  display: "grid",
  gridTemplateAreas: "'dot position . date' 'line body body body'",
  gridTemplateColumns: "25px 1fr  10px 160px",
  gridTemplateRows: "40px 1fr",
  alignItems: "center",
  maxWidth: "500px",
});

const ExperiencePosition = styled("strong", {
  fontWeight: 500,
  gridArea: "position",
});

const ExperienceDate = styled("em", {
  fontSize: "0.9em",
  fontStyle: "normal",
  fontWeight: 300,
  gridArea: "date",
  textAlign: "right",
});

const ExperienceBody = styled("div", {
  minHeight: "1em",
  gridArea: "body",
});

const ExperienceSummary = styled("p", { wordBreak: "break-word" });

const ExperienceHighlights = styled("ul", { marginLeft: "0px" });

function WorkExperience({ experiencies }) {
  if (experiencies.length === 0) return null;

  const groupedExperiences = experiencies.reduce((works, work) => {
    if (
      works.length > 0 &&
      work.company === works[works.length - 1][0].company
    ) {
      works[works.length - 1].push(work);
    } else {
      works.push([work]);
    }
    return works;
  }, []);

  return (
    <Section id="section-work">
      <h3>Experience</h3>
      {groupedExperiences.map((companyGroup) => (
        <article key={JSON.stringify(companyGroup)}>
          <H4>{companyGroup[0].company}</H4>
          {companyGroup.map((experience, index) => (
            <ExperienceContainer key={JSON.stringify(experience)}>
              <Dot />
              <ExperiencePosition>{experience.position}</ExperiencePosition>
              {experience.startDate ? (
                experience.endDate ? (
                  <ExperienceDate>
                    {format(new Date(experience.startDate), "MMM yyyy")}
                    {" - "}
                    {format(new Date(experience.endDate), "MMM yyyy")}
                  </ExperienceDate>
                ) : (
                  <ExperienceDate>Current</ExperienceDate>
                )
              ) : null}
              {index < companyGroup.length - 1 && <Line />}
              <ExperienceBody>
                {experience.summary && (
                  <ExperienceSummary>{experience.summary}</ExperienceSummary>
                )}
                {experience.highlights && (
                  <ExperienceHighlights>
                    {experience.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ExperienceHighlights>
                )}
              </ExperienceBody>
            </ExperienceContainer>
          ))}
        </article>
      ))}
    </Section>
  );
}

function Languages({ languages }) {
  if (languages.length === 0) return null;

  return (
    <Section id="section-languages">
      <h3>Languages</h3>
      <div>
        {languages.map((language) => (
          <article key={language.language}>
            <h6>
              {language.language} <Small>({language.fluency})</Small>
            </h6>
          </article>
        ))}
      </div>
    </Section>
  );
}
