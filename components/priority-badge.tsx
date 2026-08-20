import type { Priority } from "@prisma/client";

const LABEL: Record<Priority, string> = {
  MUST: "必須",
  SHOULD: "應該",
  COULD: "可以",
};

const CLASS: Record<Priority, string> = {
  MUST: "bg-red-50 text-red-700",
  SHOULD: "bg-orange-50 text-orange-700",
  COULD: "bg-gray-100 text-gray-500",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={
        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium " + CLASS[priority]
      }
    >
      {LABEL[priority]}
    </span>
  );
}
