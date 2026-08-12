import { exportAll, logActivity } from "./storage";
import { todayISO } from "./dates";

/** Serialize the whole workspace and hand it to the browser as a download. */
export function downloadBackup() {
  const envelope = exportAll();
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `career-command-center-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  logActivity("updated", "JSON backup exported");
}
