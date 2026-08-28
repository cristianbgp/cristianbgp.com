import { MailsIcon } from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/icons";

const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/cristianbgp",
    icon: GithubIcon,
  },
  {
    name: "X",
    url: "https://x.com/cristianbgp",
    icon: XIcon,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/cristianbgp",
    icon: LinkedinIcon,
  },
  {
    name: "Mail",
    url: "mailto:cristian.granda.pastor@gmail.com",
    icon: MailsIcon,
  },
];

export default function SocialLinks() {
  return (
    <div className="flex gap-4 pointer-events-auto">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target={link.url.startsWith("mailto:") ? undefined : "_blank"}
          rel={
            link.url.startsWith("mailto:") ? undefined : "noopener noreferrer"
          }
          aria-label={link.name}
          className="-m-2 rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <link.icon
            aria-hidden="true"
            className="h-6 w-6 stroke-2 transition-transform duration-300 hover:scale-110 motion-reduce:transform-none"
          />
        </a>
      ))}
    </div>
  );
}
