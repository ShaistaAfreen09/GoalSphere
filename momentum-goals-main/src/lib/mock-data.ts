export type Role = "employee" | "manager" | "admin";
export type UoM = "Numeric" | "Percentage" | "Timeline" | "Zero-based";
export type GoalStatus = "Not Started" | "On Track" | "Completed";
export type ApprovalStatus = "Draft" | "Pending" | "Approved" | "Rejected";

export interface Goal {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  thrustArea: string;
  uom: UoM;
  target: number;
  actual: number;
  weightage: number;
  status: GoalStatus;
  approval: ApprovalStatus;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  comments: { author: string; text: string; at: string }[];
  locked: boolean;
  shared?: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  managerId?: string;
  avatar: string;
  department: string;
}

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
}

export const THRUST_AREAS = [
  "Revenue Growth",
  "Customer Success",
  "Operational Excellence",
  "Innovation",
  "People & Culture",
  "Quality & Compliance",
];

export const USERS: User[] = [
  { id: "u1", name: "Alex Morgan", role: "employee", managerId: "u4", avatar: "AM", department: "Engineering" },
  { id: "u2", name: "Priya Shah", role: "employee", managerId: "u4", avatar: "PS", department: "Engineering" },
  { id: "u3", name: "Jordan Lee", role: "employee", managerId: "u4", avatar: "JL", department: "Engineering" },
  { id: "u4", name: "Sam Rivera", role: "manager", avatar: "SR", department: "Engineering" },
  { id: "u5", name: "Taylor Chen", role: "admin", avatar: "TC", department: "People Ops" },
];

const today = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => iso(new Date(today.getTime() - n * 86400000));

export const INITIAL_GOALS: Goal[] = [
  {
    id: "g1", ownerId: "u1", ownerName: "Alex Morgan",
    title: "Ship Platform v3.0", description: "Lead release of platform v3 with 5 net-new modules.",
    thrustArea: "Innovation", uom: "Timeline", target: 100, actual: 65, weightage: 25,
    status: "On Track", approval: "Approved", quarter: "Q2",
    comments: [{ author: "Sam Rivera", text: "Great progress, keep momentum.", at: daysAgo(4) }],
    locked: false, createdAt: daysAgo(40),
  },
  {
    id: "g2", ownerId: "u1", ownerName: "Alex Morgan",
    title: "Reduce P1 incidents", description: "Cut critical production incidents.",
    thrustArea: "Quality & Compliance", uom: "Numeric", target: 4, actual: 2, weightage: 20,
    status: "On Track", approval: "Approved", quarter: "Q2", comments: [], locked: false, createdAt: daysAgo(38),
  },
  {
    id: "g3", ownerId: "u1", ownerName: "Alex Morgan",
    title: "Mentor 2 engineers", description: "Structured mentorship with quarterly reviews.",
    thrustArea: "People & Culture", uom: "Numeric", target: 2, actual: 2, weightage: 15,
    status: "Completed", approval: "Approved", quarter: "Q1", comments: [], locked: true, createdAt: daysAgo(120),
  },
  {
    id: "g4", ownerId: "u1", ownerName: "Alex Morgan",
    title: "Improve test coverage", description: "Raise coverage across core services.",
    thrustArea: "Operational Excellence", uom: "Percentage", target: 85, actual: 72, weightage: 20,
    status: "On Track", approval: "Approved", quarter: "Q2", comments: [], locked: false, createdAt: daysAgo(30),
  },
  {
    id: "g5", ownerId: "u1", ownerName: "Alex Morgan",
    title: "Zero security findings", description: "Resolve all high/critical SAST findings.",
    thrustArea: "Quality & Compliance", uom: "Zero-based", target: 0, actual: 1, weightage: 20,
    status: "On Track", approval: "Pending", quarter: "Q2", comments: [], locked: false, createdAt: daysAgo(5),
  },
  {
    id: "g6", ownerId: "u2", ownerName: "Priya Shah",
    title: "Grow ARR pipeline", description: "Source $1.2M qualified pipeline.",
    thrustArea: "Revenue Growth", uom: "Numeric", target: 1200000, actual: 780000, weightage: 30,
    status: "On Track", approval: "Approved", quarter: "Q2", comments: [], locked: false, createdAt: daysAgo(45),
  },
  {
    id: "g7", ownerId: "u2", ownerName: "Priya Shah",
    title: "NPS to 60", description: "Lift customer NPS via onboarding redesign.",
    thrustArea: "Customer Success", uom: "Numeric", target: 60, actual: 54, weightage: 25,
    status: "On Track", approval: "Approved", quarter: "Q2", comments: [], locked: false, createdAt: daysAgo(40),
  },
  {
    id: "g8", ownerId: "u3", ownerName: "Jordan Lee",
    title: "Launch design system v2", description: "Migrate 100% of product surfaces.",
    thrustArea: "Innovation", uom: "Percentage", target: 100, actual: 100, weightage: 30,
    status: "Completed", approval: "Approved", quarter: "Q1", comments: [], locked: true, createdAt: daysAgo(110),
  },
  {
    id: "g9", ownerId: "u3", ownerName: "Jordan Lee",
    title: "A11y compliance WCAG AA", description: "Audit & remediate top flows.",
    thrustArea: "Quality & Compliance", uom: "Percentage", target: 100, actual: 0, weightage: 25,
    status: "Not Started", approval: "Pending", quarter: "Q3", comments: [], locked: false, createdAt: daysAgo(2),
  },
];

export const INITIAL_AUDIT: AuditLog[] = [
  { id: "a1", at: daysAgo(1), actor: "Sam Rivera", action: "Approved goal", target: "Ship Platform v3.0" },
  { id: "a2", at: daysAgo(2), actor: "Taylor Chen", action: "Pushed shared goal", target: "Annual Security Training" },
  { id: "a3", at: daysAgo(3), actor: "Alex Morgan", action: "Updated actual", target: "Improve test coverage" },
  { id: "a4", at: daysAgo(5), actor: "Taylor Chen", action: "Unlocked goal", target: "Mentor 2 engineers" },
  { id: "a5", at: daysAgo(6), actor: "Sam Rivera", action: "Rejected goal", target: "Vague learning goal" },
];
