import { Button } from "@/components/ui/button";

function OpenSettingsButton() {
  return (
    <Button
      type="button"
      variant="muted"
      size="md"
      className="px-4"
      onClick={() => void browser.runtime.openOptionsPage()}
    >
      Open settings
    </Button>
  );
}

export default OpenSettingsButton;
