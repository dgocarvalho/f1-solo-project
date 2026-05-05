import { Loader2, Inbox } from "lucide-react";

export const LoadingState = ({ message = "Carregando..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

export const EmptyState = ({ message = "Nenhum dado encontrado.", icon: Icon = Inbox }: { message?: string; icon?: React.ElementType }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16">
    <Icon className="h-10 w-10 text-muted-foreground/50" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
