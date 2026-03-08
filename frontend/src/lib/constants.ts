export const ROLES = {
  ADMIN: "admin",
  HR: "hr",
  INTERVIEWER: "interviewer",
} as const;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", roles: ["admin", "hr", "interviewer"] },
  { label: "Resumes", href: "/resumes", roles: ["admin", "hr"] },
  { label: "Search", href: "/search", roles: ["admin", "hr", "interviewer"] },
  { label: "Chatbot", href: "/chatbot", roles: ["admin", "hr", "interviewer"] },
  { label: "Interviews", href: "/interviews", roles: ["admin", "hr", "interviewer"] },
  { label: "Users", href: "/admin/users", roles: ["admin"] },
];
