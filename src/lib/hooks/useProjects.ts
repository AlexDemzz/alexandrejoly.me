import Image from "@/images/alexandrejoly-1.gif";

import SimplrIcons1 from "@/images/simplr-icons/1.webp";
import SimplrIcons2 from "@/images/simplr-icons/2.webp";
import SimplrIcons3 from "@/images/simplr-icons/3.webp";

import Portfolio1 from "/videos/1.webm";
import Portfolio2 from "/videos/2.webm";
import Portfolio3 from "/videos/3.webm";

import Yoojo1 from "@/images/yoojo/1.webp";
import Yoojo2 from "@/images/yoojo/2.webp";
import Yoojo3 from "@/images/yoojo/3.webp";
import Yoojo4 from "@/images/yoojo/4.webp";

import Simplr1 from "@/images/simplr-design-system/1.webp";
import Simplr2 from "@/images/simplr-design-system/2.webp";
import Simplr3 from "@/images/simplr-design-system/3.webp";
import Simplr4 from "@/images/simplr-design-system/4.webp";

export default function useProjects() {
  return [
    {
      id: "yoojo",
      title: "Yoojo",
      description:
        "Yoojo is an online platform that connects people with service providers for home-related tasks such as cleaning, gardening, babysitting, and handyman services. It allows users to book verified and insured professionals easily, offering a streamlined and secure way to manage household needs.",
      tags: ["React.js", "UI/UX Design", "Visual Identity"],
      date: "2018-now",
      images: [Yoojo1, Yoojo2, Yoojo3, Yoojo4],
    },
    {
      id: "simplr-design-system",
      title: "Simplr Design System",
      description:
        "Simplr is the name of yoojo design system. I designed and created it from scratch, ensuring consistency and efficiency across various applications. This includes standardized components, guidelines, and best practices that streamline the design and development process, making it easier to maintain and scale projects effectively.",
      tags: ["UI/UX Design"],
      date: "2018-now",
      images: [Simplr1, Simplr2, Simplr3, Simplr4],
    },
    {
      id: "simplr-icons",
      title: "Simplr Icons",
      description:
        "This icon pack was meticulously designed to align with the efficiency of the Simplr Design System. Each icon in the pack was created to address specific needs, ensuring a cohesive and streamlined visual experience.",
      tags: ["Iconography"],
      date: "2018-now",
      images: [SimplrIcons1, SimplrIcons2, SimplrIcons3],
    },
    {
      id: "portfolio-2018",
      title: "Portfolio 2018",
      description:
        "In 2018, I created one of my first React.js projects to showcase my skills in UI/UX design and react.js development.",
      tags: ["React.js", "Visual Identity", "UI/UX Design"],
      date: "2018",
      videos: [Portfolio1, Portfolio2, Portfolio3],
    },
  ];
}
