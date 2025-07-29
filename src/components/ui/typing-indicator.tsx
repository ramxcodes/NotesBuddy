import AIResponseLoader, {
  AITypingLoader,
  AIBrainLoader,
} from "@/components/ai/AIResponseLoader";

interface TypingIndicatorProps {
  text?: string;
  variant?: "default" | "typing" | "brain";
}

export function TypingIndicator({
  text,
  variant = "default",
}: TypingIndicatorProps) {
  const LoaderComponent = {
    default: AIResponseLoader,
    typing: AITypingLoader,
    brain: AIBrainLoader,
  }[variant];

  return (
    <div className="justify-left flex space-x-1">
      <div className="bg-muted rounded-lg p-3">
        <LoaderComponent text={text} />
      </div>
    </div>
  );
}
