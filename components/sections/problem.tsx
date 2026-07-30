import {
  MessageCircle,
  MapPin,
  Receipt,
  StickyNote,
  HardDrive,
} from "lucide-react";

const SCATTERED_APPS = [
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: MapPin, label: "Google Maps" },
  { icon: Receipt, label: "Splitwise" },
  { icon: StickyNote, label: "Notes" },
  { icon: HardDrive, label: "Google Drive" },
];

export function Problem() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Trip planning is scattered across too many apps
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SCATTERED_APPS.map((app) => (
            <div
              key={app.label}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 p-6"
            >
              <app.icon className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {app.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-lg text-muted-foreground">
          Tripzy brings all of it into one intelligent, AI-powered workspace.
        </p>
      </div>
    </section>
  );
}