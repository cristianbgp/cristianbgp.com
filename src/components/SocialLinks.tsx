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
          target="_blank"
          rel="noopener noreferrer"
        >
          <link.icon className="w-6 h-6 stroke-2 hover:scale-110 transition-all duration-300" />
        </a>
      ))}
    </div>
  );
}
