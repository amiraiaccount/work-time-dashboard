import type { DayStatus } from "@/types";

const styles: Record<DayStatus, string> = {
  "اضافه کار": "status-overtime",
  "کم کاری": "status-underwork",
  کامل: "status-complete",
  مرخصی: "status-leave",
  تعطیل: "status-holiday",
  غایب: "status-absent",
  "اطلاعات هنوز وارد نشده": "status-empty",
};

export default function StatusBadge({ status }: { status: DayStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100"}`}
    >
      {status}
    </span>
  );
}
