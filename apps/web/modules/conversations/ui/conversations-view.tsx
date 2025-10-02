import Image from "next/image";
export const ConversationsView = () => {
  return (
    <div className="flex h-full flex-1 flex-col gap-y-4 bg-muted">
      <div className="flex flex-1 flex-col items-center justify-center gap-x-2">
        <Image alt="Logo" height={140} width={180} src="/logo_full.svg" />
        <p className="mt-2 text-sm text-secondary-foreground/80">
          Click on any conversation to view chat
        </p>
        {/* <p className="font-semibold text-lg">Echo</p> */}
      </div>
    </div>
  );
};
