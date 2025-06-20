import { ImageResponse } from "next/og";
import {
  UNIVERSITY_OPTIONS,
  DEGREE_OPTIONS,
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
} from "@/utils/constant";
import { getNoteBySlug } from "@/dal/note/helper";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const getDisplayNameBySanityValue = (
  sanityValue: string | null | undefined,
  optionsObject:
    | typeof UNIVERSITY_OPTIONS
    | typeof DEGREE_OPTIONS
    | typeof YEAR_OPTIONS
    | typeof SEMESTER_OPTIONS
) => {
  if (!sanityValue) return "";

  const option = Object.values(optionsObject).find(
    (option) => option.sanityValue === sanityValue
  );
  return option?.title || sanityValue;
};

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  const slug = (await params).slug;
  const note = await getNoteBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          backgroundImage:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          fontFamily: "system-ui",
          position: "relative",
        }}
      >
        {/* Main Content Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "80px 60px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: "bold",
              color: "#ffffff",
              lineHeight: 1.2,
              marginBottom: "32px",
              textAlign: "center",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {note?.title || "Note"}
          </div>

          {/* Metadata Cards Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "24px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "40px",
            }}
          >
            {/* University & Degree Card */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "20px 28px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "180px",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "flex",
                }}
              >
                Institution
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "#ffffff",
                  fontWeight: "600",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {getDisplayNameBySanityValue(
                  note?.university,
                  UNIVERSITY_OPTIONS
                ) || "University"}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "#e2e8f0",
                  marginTop: "4px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {getDisplayNameBySanityValue(note?.degree, DEGREE_OPTIONS) ||
                  "Degree"}
              </div>
            </div>

            {/* Academic Info Card */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "20px 28px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "160px",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                Academic
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "#ffffff",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {getDisplayNameBySanityValue(note?.year, YEAR_OPTIONS) ||
                  "Year"}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "#e2e8f0",
                  marginTop: "4px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {getDisplayNameBySanityValue(
                  note?.semester,
                  SEMESTER_OPTIONS
                ) || "Semester"}
              </div>
            </div>

            {/* Subject Card */}
            {note?.subject && (
              <div
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "20px 28px",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "180px",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: "#93c5fd",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  Subject
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "#ffffff",
                    fontWeight: "600",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {note.subject}
                </div>
              </div>
            )}
          </div>

          {/* Syllabus */}
          {note?.syllabus && (
            <div
              style={{
                fontSize: 20,
                color: "#cbd5e1",
                textAlign: "center",
                fontStyle: "italic",
                marginBottom: "20px",
                maxWidth: "800px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
              }}
            >
              &quot;{note.syllabus}&quot;
            </div>
          )}
        </div>

        {/* Website Watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            padding: "12px 20px",
            borderRadius: "50px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
            }}
          />
          <div
            style={{
              fontSize: 16,
              color: "#ffffff",
              fontWeight: "500",
              display: "flex",
            }}
          >
            Notes Buddy
          </div>
        </div>

        {/* Decorative Elements */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "4px",
            background:
              "linear-gradient(90deg, #3b82f6, #10b981, #f59e0b, #ef4444)",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
