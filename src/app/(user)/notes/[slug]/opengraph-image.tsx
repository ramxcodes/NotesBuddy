import { ImageResponse } from "next/og";
import { getNoteBySlug } from "@/dal/note/helper";

export const alt = "Notes Buddy - Study Note";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          fontFamily: "system-ui",
          position: "relative",
          padding: "60px",
        }}
      >
        {/* Main Content Container with Neuro Border */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            border: "4px solid #000000",
            borderRadius: "0px",
            boxShadow: "8px 8px 0px #000000",
            padding: "60px 50px",
            width: "100%",
            maxWidth: "1000px",
            position: "relative",
          }}
        >
          {/* Title with Excon Font Style */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: "#000000",
              backgroundColor: "#ffffff",
              lineHeight: 1.1,
              marginBottom: "40px",
              textAlign: "center",
              maxWidth: "100%",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {note?.title || "Study Note"}
          </div>

          {/* Subject Badge - Neuro Style */}
          {note?.subject && (
            <div
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "12px 24px",
                border: "3px solid #000000",
                borderRadius: "0px",
                fontSize: 18,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "32px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {note.subject}
            </div>
          )}

          {/* Syllabus with Tracking Tight */}
          {note?.syllabus && (
            <div
              style={{
                fontSize: 18,
                color: "#333333",
                textAlign: "center",
                fontStyle: "italic",
                marginBottom: "20px",
                maxWidth: "700px",
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
                display: "flex",
                justifyContent: "center",
              }}
            >
              &quot;{note.syllabus}&quot;
            </div>
          )}

          {/* Decorative Corner Elements */}
          <div
            style={{
              position: "absolute",
              top: "-2px",
              left: "-2px",
              width: "20px",
              height: "20px",
              backgroundColor: "#000000",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "20px",
              height: "20px",
              backgroundColor: "#000000",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-2px",
              left: "-2px",
              width: "20px",
              height: "20px",
              backgroundColor: "#000000",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "20px",
              height: "20px",
              backgroundColor: "#000000",
              display: "flex",
            }}
          />
        </div>

        {/* Branding - Neuro Style */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#000000",
            color: "#ffffff",
            padding: "8px 16px",
            border: "3px solid #000000",
            borderRadius: "0px",
            boxShadow: "3px 3px 0px #666666",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
            }}
          />
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "flex",
            }}
          >
            Notes Buddy
          </div>
        </div>

        {/* Grid Pattern Background */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            opacity: 0.03,
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            zIndex: 0,
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
