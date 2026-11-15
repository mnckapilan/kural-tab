import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useKural } from "@/context/KuralContext";
import { cn } from "@/lib/utils";

interface KuralNumberJumpProps {
  kuralNumber: number;
}

/**
 * The current kural's number. Clicking it turns it into an input: type a
 * number and press Enter to go to that kural, or Escape to cancel.
 */
function KuralNumberJump({ kuralNumber }: KuralNumberJumpProps) {
  const { selectKuralByNumber, kuralData } = useKural();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [invalid, setInvalid] = useState(false);
  // Set when the input closes via Enter/Escape (not blur), so keyboard focus
  // goes back to the number button rather than being dropped on <body>.
  const restoreFocus = useRef(false);
  const total = kuralData?.kural.length ?? 1330;

  const open = (): void => {
    setDraft(String(kuralNumber));
    setInvalid(false);
    setEditing(true);
  };

  const close = (returnFocus: boolean): void => {
    restoreFocus.current = returnFocus;
    setEditing(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (/^\d+$/.test(trimmed) && selectKuralByNumber(Number(trimmed))) {
      close(true);
    } else {
      setInvalid(true);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    }
  };

  if (editing) {
    return (
      <form onSubmit={submit} className="flex">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={`Go to kural (1–${total})`}
          aria-invalid={invalid}
          data-testid="kural-number-input"
          value={draft}
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            setDraft(e.target.value);
            setInvalid(false);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => close(false)}
          className={cn(
            "w-16 border-b border-border bg-transparent text-foreground outline-none focus-visible:border-foreground",
            invalid && "border-destructive focus-visible:border-destructive",
          )}
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      ref={(el) => {
        if (el && restoreFocus.current) {
          restoreFocus.current = false;
          el.focus();
        }
      }}
      onClick={open}
      aria-label={`Kural ${kuralNumber}. Go to another kural`}
      title="Go to kural number"
      className="cursor-text rounded-sm outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span data-testid="kural-number-value">{kuralNumber}</span>
    </button>
  );
}

export default KuralNumberJump;
