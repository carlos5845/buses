import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  text = "Cargando...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      {content}
    </div>
  );
}
