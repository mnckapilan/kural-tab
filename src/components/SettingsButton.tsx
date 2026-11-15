import { Settings } from "lucide-react";
import { m } from "motion/react";
import { Button } from "@/components/ui/button";
import { ENTRANCE } from "@/lib/motion";

// Opens the options page (options.html, `open_in_tab`) in its own tab.
function SettingsButton() {
  return (
    <m.div
      className="fixed top-5 right-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: ENTRANCE }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="rounded-full"
        aria-label="Settings"
        onClick={() => void browser.runtime.openOptionsPage()}
      >
        <Settings className="size-6" />
      </Button>
    </m.div>
  );
}

export default SettingsButton;
