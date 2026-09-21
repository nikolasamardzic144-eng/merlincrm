export const STATUS_LABELS: Record<string, string> = {
  due: "Čeka podsetnik",
  reminded: "Podsetnik poslat",
  confirmed: "Termin potvrđen",
  reschedule_requested: "Traži novi termin",
  provera_poslata: "Čeka potvrdu da je posao obavljen",
  completed: "Posao obavljen - čeka fakturu",
  payment_reminded: "Čeka naplatu",
};

export const STATUS_COLORS: Record<string, string> = {
  due: "bg-gray-100 text-gray-700",
  reminded: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  reschedule_requested: "bg-yellow-100 text-yellow-800",
  provera_poslata: "bg-purple-100 text-purple-700",
  completed: "bg-orange-100 text-orange-700",
  payment_reminded: "bg-red-100 text-red-700",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
}
