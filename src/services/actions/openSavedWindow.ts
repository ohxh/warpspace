import { TrackedVisit, TrackedWindow, db } from "../database/DatabaseSchema";

export async function openSavedWindow(id: number): Promise<TrackedWindow> {
  let w: TrackedWindow | undefined;
  let visits: TrackedVisit[] | undefined;

  await db.transaction("rw", db.tabs, db.windows, async (t) => {
    [w, visits] = await Promise.all([
      db.windows.get(id),
      db.tabs
        .where("windowId")
        .equals(id)
        .and((t) => t.status === "open" || t.closingReason === "window-closed")
        .toArray(),
    ]);
  });

  if (w === undefined || visits === undefined) {
    throw new Error("Window undefined");
  }

  chrome.windows.create({
    focused: true,
    url: visits.map((t) => "https://warpspace.app/restore" + "?id=" + t.id),
  });

  return w;

  // Tell chrome to create window. Tabs is link to chrome extension urls.
  // Each extension
  // Tell chrome to add each tab

  // -> Callbacks hit tabstore
  // -> Ignore?
  // -> Update "openingSoon"?

  // openingSoon: true
}
