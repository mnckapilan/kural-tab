import {
  SettingsGroup,
  SettingsRow,
} from "@/components/settings/SettingsLayout";

const LINK =
  "text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

function AboutSettings() {
  return (
    <div>
      <div className="mb-10 flex items-center gap-4">
        <img src="/icon/128.png" alt="" className="size-14" />
        <div>
          <div className="text-xl text-foreground">Kural Tab</div>
          <div className="text-sm text-muted-foreground">
            Version {browser.runtime.getManifest().version}
          </div>
        </div>
      </div>
      <SettingsGroup title="Links">
        <SettingsRow label="Source code">
          <a
            className={LINK}
            href="https://github.com/mnckapilan/kural-tab"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </SettingsRow>
        <SettingsRow label="Rate or review">
          <a
            className={LINK}
            href="https://chromewebstore.google.com/detail/njidhifbpgbfadoffhibkjnnkfhcglpc"
            target="_blank"
            rel="noreferrer"
          >
            Chrome Web Store
          </a>
        </SettingsRow>
        <SettingsRow
          label="Fonts"
          description="Noto Sans Tamil, SIL Open Font License 1.1"
        >
          <a className={LINK} href="/fonts/LICENSE.txt" target="_blank">
            Licence
          </a>
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}

export default AboutSettings;
