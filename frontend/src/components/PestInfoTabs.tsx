import { useState } from "react";
import { Card } from "@/components/ui/card";
import { pestInfoMap } from "@/data/pestInfo";

interface Props {
  pestName: string;
  language: "en" | "hi" | "mr";
}

export const PestInfoTabs = ({ pestName, language }: Props) => {
  const [tab, setTab] = useState<"info" | "recommendation">("info");

  const normalize = (name: string) =>
    name
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .trim();

  const pestKey = normalize(pestName);

  // Safe fallback to English if language is undefined or missing
  const data =
    pestInfoMap[pestKey]?.[language] ??
    pestInfoMap[pestKey]?.["en"];

  const labels = {
    en: {
      info: "Information",
      rec: "Recommendations",
      crop: "Crop Affected:",
      cultural: "Cultural Methods",
      biological: "Biological Control",
      chemical: "Chemical Control",
      unavailable: "Information will be available for this pest soon."
    },
    hi: {
      info: "जानकारी",
      rec: "सिफारिशें",
      crop: "प्रभावित फसल:",
      cultural: "सांस्कृतिक उपाय",
      biological: "जैविक नियंत्रण",
      chemical: "रासायनिक नियंत्रण",
      unavailable: "इस कीट के लिए जानकारी जल्द उपलब्ध होगी।"
    },
    mr: {
      info: "माहिती",
      rec: "शिफारसी",
      crop: "प्रभावित पीक:",
      cultural: "सांस्कृतिक पद्धती",
      biological: "जैविक नियंत्रण",
      chemical: "रासायनिक नियंत्रण",
      unavailable: "या कीटकासाठी माहिती लवकरच उपलब्ध होईल."
    }
  };

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
          {labels[language].info}
        </button>

        <button
          onClick={() => setTab("recommendation")}
          className={`pb-2 ${
            tab === "recommendation"
              ? "font-semibold border-b-2 border-primary"
              : ""
          }`}
        >
          {labels[language].rec}
        </button>
      </div>

      {/* CONTENT */}
      {!data ? (
        <p className="text-sm text-muted-foreground">
          {labels[language].unavailable}
        </p>
      ) : tab === "info" ? (
        <>
          <p className="font-medium mb-2">
            {labels[language].crop} {data.crop}
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
            <p className="font-medium">
              {labels[language].cultural}
            </p>
            <ul className="list-disc pl-5">
              {data.recommendations.cultural.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-medium">
              {labels[language].biological}
            </p>
            <ul className="list-disc pl-5">
              {data.recommendations.biological.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-medium">
              {labels[language].chemical}
            </p>
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