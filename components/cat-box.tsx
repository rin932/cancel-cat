type CatBoxProps = {
  open?: boolean;
};

export function CatBox({ open = false }: CatBoxProps) {
  return (
    <div
      className="grid h-28 w-28 place-items-center rounded-2xl border border-line text-5xl"
      aria-hidden="true"
    >
      {open ? "😺" : "📦"}
    </div>
  );
}
