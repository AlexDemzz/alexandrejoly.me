import SimplrIcons1 from "@/images/simplr-icons/1.webp";
import SimplrIcons2 from "@/images/simplr-icons/2.webp";
import SimplrIcons3 from "@/images/simplr-icons/3.webp";
import SimplrIcons4 from "@/images/simplr-icons/4.webp";

import Yoojo1 from "@/images/yoojo/1.webp";
import Yoojo2 from "@/images/yoojo/2.webp";
import Yoojo3 from "@/images/yoojo/3.webp";
import Yoojo4 from "@/images/yoojo/4.webp";

import Simplr1 from "@/images/simplr-design-system/1.webp";
import Simplr2 from "@/images/simplr-design-system/2.webp";
import Simplr3 from "@/images/simplr-design-system/3.webp";

export default function useProjects() {
  return [
    {
      id: "yoojo",
      title: "Yoojo",
      description:
        "Yoojo is an online platform that connects people with service providers for home-related tasks like cleaning, gardening, babysitting, and handyman services. It makes it easy for users to book verified and insured professionals, providing a convenient and secure way to handle household needs. I work on this project as a Front-end Developer and UI/UX designer.",
      tags: ["React", "UI/UX Design", "Visual Identity"],
      date: "Since 2018",
      images: [Yoojo1, Yoojo2, Yoojo3, Yoojo4],
    },
    {
      id: "simplr-design-system",
      title: "Simplr Design System",
      description:
        "Simplr is the design system for Yoojo, which I designed and created from scratch. It ensures consistency and efficiency across our website and mobile app. Simplr includes 60 fully customizable components with over 2000 Figma variants. The design system was developed to be used with React Native and React JS, incorporating standardized components, guidelines, and best practices that simplify the design and development process, making it easier to maintain and scale projects effectively.",
      tags: ["UI/UX Design", "React", "Figma"],
      date: "Since 2018",
      images: [Simplr1, Simplr2, Simplr3],
    },
    {
      id: "simplr-icons",
      title: "Simplr Icons",
      description:
        "This icon pack includes more than 200+ icons and was meticulously designed to align with the efficiency of the Simplr Design System. Each icon in the pack was created to address specific needs, ensuring a cohesive and streamlined visual experience.",
      tags: ["Iconography"],
      date: "Since 2018",
      images: [SimplrIcons1, SimplrIcons2, SimplrIcons3, SimplrIcons4],
    },
    {
      id: "portfolio-2018",
      title: "Portfolio 2018",
      description:
        "In 2018, I embarked on one of my initial React.js projects, aiming to demonstrate my capabilities in UI/UX design and React.js development. This project was a significant milestone in my journey, allowing me to develop my skills.",
      tags: ["React", "Visual Identity", "UI/UX Design"],
      date: "July 2018",
      videos: ["/1.webm", "/2.webm", "/3.webm"],
    },
  ];
}
