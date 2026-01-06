import { useState } from "react";
import { Card } from "@/components/ui/card";
import { pestInfoMap } from "@/data/pestInfo";

interface Props {
  pestName: string;
}

export const PestInfoTabs = ({ pestName }: Props) => {
  const [tab, setTab] = useState<"info" | "recommendation">("info");

  const normalize = (name: string) =>
    name
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .trim();

  const pestKey = normalize(pestName);
  const data = pestInfoMap[pestKey];

  return (
    <Card className="p-4 mt-4">
      {/* TAB HEADER */}
      <div className="flex gap-6 border-b mb-3 text-sm">
        <button
          onClick={() => setTab("info")}
          className={`pb-2 ${
            tab === "info" ? "font-semibold border-b-2 border-primary" : ""
          }`}
        >
          Information
        </button>

        <button
          onClick={() => setTab("recommendation")}
          className={`pb-2 ${
            tab === "recommendation"
              ? "font-semibold border-b-2 border-primary"
              : ""
          }`}
        >
          Recommendations
        </button>
      </div>

      {/* CONTENT */}
      {!data ? (
        <p className="text-sm text-muted-foreground">
          Information will be available for this pest soon.
        </p>
      ) : tab === "info" ? (
        <>
          <p className="font-medium mb-2">
            Crop Affected: {data.crop}
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {data.damage.map((d: string, i: number) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </>
      ) : (
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Cultural Methods</p>
            <ul className="list-disc pl-5">
              {data.recommendations.cultural.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-medium">Biological Control</p>
            <ul className="list-disc pl-5">
              {data.recommendations.biological.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-medium">Chemical Control</p>
            <ul className="list-disc pl-5">
              {data.recommendations.chemical.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};
