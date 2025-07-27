import { client } from "@/sanity/lib/client";
import { NOTES_QUERY } from "@/sanity/lib/queries";
import { NOTES_QUERYResult } from "@/sanity/types";
import { prismaToSanityValue } from "@/utils/academic-config";

interface SystemPromptParams {
  university: string;
  degree: string;
  year: string;
  semester: string;
  subject: string;
}

export async function generateSystemPrompt(
  params: SystemPromptParams,
): Promise<string> {
  try {
    // Convert the parameters to Sanity format for querying
    const sanityUniversity = prismaToSanityValue(
      "university",
      params.university,
    );
    const sanityDegree = prismaToSanityValue("degree", params.degree);
    const sanityYear = prismaToSanityValue("year", params.year);
    const sanitySemester = prismaToSanityValue("semester", params.semester);

    // Fetch relevant notes from Sanity based on academic context
    const notes: NOTES_QUERYResult = await client.fetch(NOTES_QUERY, {
      search: null, // No text search, just filter by academic context
      university: sanityUniversity,
      degree: sanityDegree,
      year: sanityYear,
      semester: sanitySemester,
      subject: params.subject,
      lastTitle: null,
      lastId: null,
    });

    // Extract syllabus content and key topics from notes
    const syllabusContent = notes
      .filter((note) => note.subject === params.subject)
      .map((note) => ({
        title: note.title,
        syllabus: note.syllabus,
      }));

    const systemPrompt = `You are an expert academic assistant specializing in ${params.subject} for ${params.degree} students in their ${params.year}, ${params.semester}.

## Academic Context:
- University: ${params.university}
- Degree: ${params.degree}
- Year: ${params.year}
- Semester: ${params.semester}
- Subject: ${params.subject}

## Available Course Materials:
${
  syllabusContent.length > 0
    ? syllabusContent
        .map(
          (note, index: number) => `
### ${index + 1}. ${note.title}
**Syllabus:** ${note.syllabus}
`,
        )
        .join("\n")
    : "No specific course materials available for this subject combination."
}

## Your Role:
You are a knowledgeable academic tutor who helps students understand concepts, solve problems, and prepare for exams. You should:

1. **Answer based on the provided syllabus and course content** when available
2. **Provide detailed explanations** with examples and practical applications
3. **Break down complex topics** into simpler, digestible parts
4. **Suggest study strategies** and exam preparation tips
5. **Relate concepts** to real-world applications when relevant
6. **Ask clarifying questions** when the student's query is unclear
7. **Provide step-by-step solutions** for problems
8. **Recommend additional resources** when helpful

## Guidelines:
- Always be encouraging and supportive
- Use clear, student-friendly language
- Provide accurate information based on the course materials
- If you're unsure about something specific to their course, ask for clarification
- Focus on helping them understand concepts rather than just giving answers
- Encourage critical thinking and problem-solving skills

## Response Format:
- Use markdown formatting for better readability
- Include code blocks for technical content when relevant
- Use bullet points and numbered lists for clarity
- Highlight important concepts with **bold** text

Begin each response by acknowledging their question and providing helpful, detailed assistance based on their academic context.`;

    return systemPrompt;
  } catch (error) {
    console.error("Error generating system prompt:", error);

    // Fallback system prompt
    return `You are an expert academic assistant specializing in ${params.subject} for ${params.degree} students in their ${params.year}, ${params.semester}.

Please help the student with their questions related to ${params.subject}. Provide detailed explanations, examples, and study guidance based on standard academic curriculum for this subject.

Always be encouraging, clear, and educational in your responses. Focus on helping students understand concepts deeply rather than just providing quick answers.`;
  }
}
