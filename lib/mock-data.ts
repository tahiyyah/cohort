/**
 * Demo content only. Events and RSVPs have no backend yet; this is the
 * data the feature-page shells render so they read as a live directory
 * instead of empty scaffolding.
 */

export interface MockApprentice {
  name: string;
  programme: string;
  cohort: string;
  location: string;
}

export const APPRENTICE_POOL: MockApprentice[] = [
  { name: "Amara Boateng", programme: "Software Engineering", cohort: "Cohort 12", location: "Peckham" },
  { name: "Finlay Okoye", programme: "Cyber Security", cohort: "Cohort 10", location: "Croydon" },
  { name: "Priya Chandran", programme: "Data", cohort: "Cohort 11", location: "Ilford" },
  { name: "Tomasz Wieczorek", programme: "Software Engineering", cohort: "Cohort 11", location: "Walthamstow" },
  { name: "Zainab Hussain", programme: "Cyber Security", cohort: "Cohort 9", location: "Tooting" },
  { name: "Leon Marsh", programme: "Data", cohort: "Cohort 12", location: "Deptford" },
  { name: "Aoife Byrne", programme: "Software Engineering", cohort: "Cohort 10", location: "Archway" },
  { name: "Kwame Asante", programme: "Cyber Security", cohort: "Cohort 11", location: "Brixton" },
  { name: "Freya Lindqvist", programme: "Data", cohort: "Cohort 9", location: "Clapham" },
  { name: "Osei Mensah", programme: "Software Engineering", cohort: "Cohort 12", location: "Stratford" },
];

export const CURRENT_MOCK_PROFILE = {
  ...APPRENTICE_POOL[0],
  bio: "Second-year SDE apprentice. I organise the Shoreditch cohort's demo days and I'm always up for a coffee-and-code session.",
  interests: ["TypeScript", "Climbing", "Board games", "Mentoring"],
};

export interface MockEvent {
  id: string;
  code: string;
  title: string;
  tags: string[];
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  isOnline: boolean;
  capacity: number;
  hostName: string;
  attendeeNames: string[];
}

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: "demo-day-sde-12",
    code: "№ 014",
    title: "Demo Day: Software Engineering Cohort 12",
    tags: ["SDE", "Demo"],
    description:
      "Cohort 12 presents the projects they've shipped this quarter. Sign-off sheets at the door, short talks, longer Q&A, drinks after.",
    startsAt: "2026-10-03T14:00:00+01:00",
    endsAt: "2026-10-03T17:00:00+01:00",
    location: "Shoreditch Campus, Studio 3",
    isOnline: false,
    capacity: 60,
    hostName: "Amara Boateng",
    attendeeNames: [
      "Tomasz Wieczorek",
      "Osei Mensah",
      "Aoife Byrne",
      "Priya Chandran",
      "Leon Marsh",
    ],
  },
  {
    id: "cyber-ctf-night",
    code: "№ 021",
    title: "Cyber Security Capture-the-Flag Night",
    tags: ["Cyber", "Social"],
    description:
      "A relaxed CTF across three difficulty tracks. No experience required — pair up with someone from another cohort and learn as you go.",
    startsAt: "2026-10-07T18:30:00+01:00",
    endsAt: "2026-10-07T21:30:00+01:00",
    location: "Online — Discord",
    isOnline: true,
    capacity: 40,
    hostName: "Finlay Okoye",
    attendeeNames: ["Zainab Hussain", "Kwame Asante", "Leon Marsh"],
  },
  {
    id: "data-coffee-code",
    code: "№ 022",
    title: "Data Apprentices Coffee & Code",
    tags: ["Data", "Networking"],
    description:
      "Bring a dataset you're stuck on. Informal, small, and usually ends with someone's dashboard getting fixed over a flat white.",
    startsAt: "2026-10-09T09:00:00+01:00",
    endsAt: "2026-10-09T10:30:00+01:00",
    location: "Camden Hub, Kitchen",
    isOnline: false,
    capacity: 20,
    hostName: "Priya Chandran",
    attendeeNames: ["Freya Lindqvist", "Leon Marsh"],
  },
  {
    id: "cross-cohort-quiz",
    code: "№ 027",
    title: "Cross-Cohort Quiz Night",
    tags: ["Social", "Networking"],
    description:
      "Teams of four, mixed across programmes on purpose. Prizes are mostly bragging rights and one real trophy that gets re-engraved every month.",
    startsAt: "2026-10-10T19:00:00+01:00",
    endsAt: "2026-10-10T21:30:00+01:00",
    location: "The Old Dispensary, Hackney",
    isOnline: false,
    capacity: 50,
    hostName: "Aoife Byrne",
    attendeeNames: [
      "Amara Boateng",
      "Zainab Hussain",
      "Osei Mensah",
      "Kwame Asante",
    ],
  },
  {
    id: "sde-portfolio-review",
    code: "№ 031",
    title: "SDE Cohort 11 Portfolio Review",
    tags: ["SDE", "Careers"],
    description:
      "Bring your portfolio for structured feedback from apprentices one cohort ahead. Sign up for a 15-minute slot or just come to watch.",
    startsAt: "2026-10-14T13:00:00+01:00",
    endsAt: "2026-10-14T16:00:00+01:00",
    location: "Shoreditch Campus, Studio 1",
    isOnline: false,
    capacity: 30,
    hostName: "Tomasz Wieczorek",
    attendeeNames: ["Amara Boateng", "Osei Mensah"],
  },
  {
    id: "women-in-tech-meetup",
    code: "№ 034",
    title: "Women in Tech Apprentices Meetup",
    tags: ["Networking", "Social"],
    description:
      "Open to apprentices of all programmes. This month: a panel on navigating end-point assessment, then open networking.",
    startsAt: "2026-10-16T18:00:00+01:00",
    endsAt: "2026-10-16T20:00:00+01:00",
    location: "Online — Zoom",
    isOnline: true,
    capacity: 80,
    hostName: "Zainab Hussain",
    attendeeNames: ["Priya Chandran", "Freya Lindqvist", "Aoife Byrne"],
  },
  {
    id: "cyber-grad-social",
    code: "№ 039",
    title: "Cyber Cohort 9 Graduation Social",
    tags: ["Cyber", "Social"],
    description:
      "Cohort 9's last official meetup before end-point assessment results land. Open bar tab for the first hour, courtesy of the alumni fund.",
    startsAt: "2026-10-22T19:30:00+01:00",
    endsAt: "2026-10-22T23:00:00+01:00",
    location: "Rooftop, Elephant & Castle",
    isOnline: false,
    capacity: 45,
    hostName: "Zainab Hussain",
    attendeeNames: ["Finlay Okoye", "Kwame Asante", "Leon Marsh", "Osei Mensah"],
  },
];

export function isEventLive(event: MockEvent, now: Date = new Date()): boolean {
  const starts = new Date(event.startsAt).getTime();
  const ends = new Date(event.endsAt).getTime();
  const t = now.getTime();
  return t >= starts && t <= ends;
}

export function getMockEvent(id: string): MockEvent | undefined {
  return MOCK_EVENTS.find((event) => event.id === id);
}

export function formatEventWhen(event: MockEvent): string {
  const starts = new Date(event.startsAt);
  return starts.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
