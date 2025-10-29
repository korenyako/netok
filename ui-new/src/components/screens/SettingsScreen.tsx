import svgPaths from "../../imports/svg-gjkejt3b1w";
import Check from "../../imports/Check";

type Screen = 'network' | 'security' | 'tools' | 'settings' | 'theme' | 'language';

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void;
}

function ArrowLeft() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="arrow-left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-left">
          <path d="M12 19L5 12M5 12L12 5M5 12H19" id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function X() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="x">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="x">
          <path d="M18 6L6 18" id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M6 6L18 18" id="Vector_2" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <div onClick={onBack} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <ArrowLeft />
      </div>
      <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <X />
      </div>
    </div>
  );
}



function SettingCard({ title, value, onClick }: { title: string; value: string; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-[#fcfafa] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-[#f5f0f0] transition-colors">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-center px-[16px] py-[12px] relative w-full">
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
              <p className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">{title}</p>
            </div>
            <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
              <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">{value}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Content({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0 w-full">
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
        <p className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.2] min-h-px min-w-px not-italic relative shrink-0 text-[24px] text-neutral-950">Настройки</p>
      </div>

      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
        <SettingCard title="Тема" value="Светлая" onClick={() => onNavigate('theme')} />
        <SettingCard title="Язык" value="Русский" onClick={() => onNavigate('language')} />
      </div>

      <div className="mt-auto content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full">
        <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[1.4] not-italic text-[#737373] text-[12px]">Версия 1.0.0</p>
      </div>
    </div>
  );
}

function Waypoints({ isActive }: { isActive?: boolean }) {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="waypoints">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="waypoints">
          <path d={svgPaths.p25276b80} id="Vector" stroke={isActive ? "var(--stroke-0, #3CB57F)" : "var(--stroke-0, #ADADAD)"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ShieldCheck({ isActive }: { isActive?: boolean }) {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="shield-check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="shield-check">
          <path d={svgPaths.p31c87d00} id="Vector" stroke={isActive ? "var(--stroke-0, #3CB57F)" : "var(--stroke-0, #ADADAD)"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Wrench({ isActive }: { isActive?: boolean }) {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="wrench">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="wrench">
          <path d={svgPaths.pdf34300} id="Vector" stroke={isActive ? "var(--stroke-0, #3CB57F)" : "var(--stroke-0, #ADADAD)"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Settings() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="settings">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="settings">
          <g id="Vector"></g>
          <path d={svgPaths.p1a317300} id="Vector_2" stroke="var(--stroke-0, #3CB57F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3697eb00} id="Vector_3" stroke="var(--stroke-0, #3CB57F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Navigation({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <div onClick={() => onNavigate('network')} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <Waypoints />
      </div>
      <div onClick={() => onNavigate('security')} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <ShieldCheck />
      </div>
      <div onClick={() => onNavigate('tools')} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <Wrench />
      </div>
      <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0">
        <Settings />
      </div>
    </div>
  );
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  return (
    <div className="bg-white relative rounded-[12px] size-full">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-center p-[16px] relative size-full">
          <Header onBack={() => onNavigate('network')} />
          <Content onNavigate={onNavigate} />
          <Navigation onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
