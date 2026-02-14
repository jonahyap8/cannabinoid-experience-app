"use client";

interface Props {
  onReset: () => void;
}

export default function ResetButton({ onReset }: Props) {
  const handleClick = () => {
    if (
      confirm(
        "Reset all data to defaults?\n\nThis will delete all custom strains and saved blends. Seed strains will be restored. This cannot be undone."
      )
    ) {
      onReset();
    }
  };

  return (
    <button onClick={handleClick} className="btn-ghost text-xs !text-bark-500 hover:!text-red-400">
      Reset Demo Data
    </button>
  );
}
