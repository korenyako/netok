import { useState } from 'react';
import svgPathsMain from "../../imports/svg-exnfuwyo3q";
import svgPaths from "../../imports/svg-egvceuz6nw";

type Screen = 'network' | 'security' | 'tools' | 'settings';

interface NetworkScreenProps {
  onNavigate: (screen: Screen, openDNS?: boolean) => void;
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

function Icon() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <X />
    </div>
  );
}

function Topbar() {
  return (
    <div className="content-stretch flex gap-[8px] items-start justify-end relative shrink-0 w-full" data-name="Topbar">
      <Icon />
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center justify-center relative shrink-0 size-[96px]" data-name="icon">
      <div className="relative shrink-0 size-[96px]" data-name="circle-check">
        <div className="absolute inset-0" data-name="Vector">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
            <g id="Vector"></g>
          </svg>
        </div>
        <div className="absolute inset-[8.33%]" data-name="Vector">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
            <path d={svgPathsMain.p2119b800} fill="var(--fill-0, #3CB57F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full" data-name="Main">
      <p className="basis-0 font-['Inter:Semi_Bold',sans-serif] font-semibold grow leading-[1.2] min-h-px min-w-px not-italic relative shrink-0 text-[36px] text-center text-neutral-950">Интернет работает</p>
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[8px] items-center justify-center leading-[1.4] not-italic relative shrink-0 text-[#151313] text-[14px] text-nowrap w-full whitespace-pre" data-name="Text">
      <p className="relative shrink-0">WI-FI</p>
      <p className="relative shrink-0">TIM-18140471</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Text">
      <Main />
      <Text />
    </div>
  );
}

function Content({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center min-h-px min-w-px px-0 py-[8px] relative shrink-0 w-full cursor-pointer hover:bg-[#fcfafa] rounded-[12px] transition-colors" data-name="Content">
      <Icon1 />
      <Text1 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center justify-center relative shrink-0 w-[16px]" data-name="icon">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="check">
        <div className="absolute bottom-[29.17%] left-[16.67%] right-[16.67%] top-1/4" data-name="Vector">
          <div className="absolute inset-[-13.64%_-9.38%]" style={{ "--stroke-0": "rgba(60, 181, 127, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 10">
              <path d={svgPathsMain.p332a3700} id="Vector" stroke="var(--stroke-0, #3CB57F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Title">
      <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Защита DNS</p>
      <Icon2 />
    </div>
  );
}

function Description() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full" data-name="Description">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Блокировка нежелательного контента включена</p>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Content">
      <Title />
      <Description />
    </div>
  );
}

function Widget({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-[#fcfafa] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-[#f5f0f0] transition-colors" data-name="Widget">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-center px-[16px] py-[12px] relative w-full">
          <Content1 />
        </div>
      </div>
    </div>
  );
}

function Wrapper({ onMapClick, onSecurityClick }: { onMapClick: () => void; onSecurityClick: () => void }) {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0 w-full" data-name="Wrapper">
      <Content onClick={onMapClick} />
      <Widget onClick={onSecurityClick} />
    </div>
  );
}

function Waypoints() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="waypoints">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="waypoints">
          <path d={svgPathsMain.p25276b80} id="Vector" stroke="var(--stroke-0, #3CB57F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon3() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <Waypoints />
    </div>
  );
}

function Icon4({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity" data-name="icon">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="shield-check">
        <div className="absolute inset-[8.33%_16.67%_8.32%_16.67%]" data-name="Vector">
          <div className="absolute inset-[-5%_-6.25%]" style={{ "--stroke-0": "rgba(173, 173, 173, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 22">
              <path d={svgPaths.p1800f300} id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon5({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity" data-name="icon">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="wrench">
        <div className="absolute inset-[8.32%_8.32%_12.49%_12.49%]" data-name="Vector">
          <div className="absolute inset-[-5.26%]" style={{ "--stroke-0": "rgba(173, 173, 173, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 21">
              <path d={svgPaths.p17917400} id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon6({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity" data-name="icon">
      <div className="relative shrink-0 size-[24px]" data-name="settings">
        <div className="absolute inset-0" data-name="Vector">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
            <g id="Vector"></g>
          </svg>
        </div>
        <div className="absolute inset-[12.5%]" data-name="Vector">
          <div className="absolute inset-[-5.556%]" style={{ "--stroke-0": "rgba(173, 173, 173, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
              <path d={svgPaths.p12020100} id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[37.5%]" data-name="Vector">
          <div className="absolute inset-[-16.667%]" style={{ "--stroke-0": "rgba(173, 173, 173, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
              <path d={svgPaths.p31479000} id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Navbar">
      <Icon3 />
      <Icon4 onClick={() => onNavigate('security')} />
      <Icon5 onClick={() => onNavigate('tools')} />
      <Icon6 onClick={() => onNavigate('settings')} />
    </div>
  );
}

export default function NetworkScreen({ onNavigate }: NetworkScreenProps) {
  const [showConnectionMap, setShowConnectionMap] = useState(false);

  if (showConnectionMap) {
    return <ConnectionMapScreen onBack={() => setShowConnectionMap(false)} onNavigate={onNavigate} />;
  }

  return (
    <div className="bg-white relative rounded-[12px] size-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-center p-[16px] relative size-full">
          <Topbar />
          <Wrapper onMapClick={() => setShowConnectionMap(true)} onSecurityClick={() => onNavigate('security', true)} />
          <Navbar onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

// Connection Map Screen Component
function ConnectionMapScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate: (screen: Screen) => void }) {
  const [isChecking, setIsChecking] = useState(true);

  setTimeout(() => setIsChecking(false), 2000);

  return (
    <div className="bg-[#fffeff] relative rounded-[12px] size-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-center p-[16px] relative size-full">
          <MapTopbar onBack={onBack} />
          <List isChecking={isChecking} />
          <Navbar onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

function ArrowLeft() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]" data-name="arrow-left">
      <div className="absolute inset-[20.833%]" data-name="Vector">
        <div className="absolute inset-[-7.143%]" style={{ "--stroke-0": "rgba(173, 173, 173, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d="M8 15L1 8M1 8L8 1M1 8H15" id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function BackIcon({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity" data-name="icon">
      <ArrowLeft />
    </div>
  );
}

function CloseIcon({ onClick }: { onClick: () => void }) {
  return (
    <div onClick={onClick} className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity" data-name="icon">
      <X />
    </div>
  );
}

function MapTopbar({ onBack }: { onBack: () => void }) {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Topbar">
      <BackIcon onClick={onBack} />
      <CloseIcon onClick={onBack} />
    </div>
  );
}

function CircleCheckIcon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="circle-check">
      <div className="absolute inset-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector"></g>
        </svg>
      </div>
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
          <path d={svgPaths.p1f368380} fill="var(--fill-0, #3CB57F)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function LoaderIcon() {
  return (
    <div className="relative shrink-0 size-[16px] animate-spin" data-name="loader">
      <div className="absolute inset-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector"></g>
        </svg>
      </div>
      <div className="absolute bottom-3/4 left-1/2 right-1/2 top-[12.5%]" data-name="Vector">
        <div className="absolute inset-[-25%_-0.5px]" style={{ "--stroke-0": "rgba(115, 115, 115, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 3">
            <path d="M0.5 2.5V0.5" id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[23.33%_23.33%_67.71%_67.71%]" data-name="Vector">
        <div className="absolute inset-[-34.884%]" style={{ "--stroke-0": "rgba(115, 115, 115, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <path d="M0.5 1.93333L1.93333 0.5" id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/2 left-3/4 right-[12.5%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-0.5px_-25%]" style={{ "--stroke-0": "rgba(115, 115, 115, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 1">
            <path d="M0.5 0.5H2.5" id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[67.71%_23.33%_23.33%_67.71%]" data-name="Vector">
        <div className="absolute inset-[-34.884%]" style={{ "--stroke-0": "rgba(115, 115, 115, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <path d="M0.5 0.5L1.93333 1.93333" id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[12.5%] left-1/2 right-1/2 top-3/4" data-name="Vector">
        <div className="absolute inset-[-25%_-0.5px]" style={{ "--stroke-0": "rgba(115, 115, 115, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 3">
            <path d="M0.5 0.5V2.5" id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[67.71%_67.71%_23.33%_23.33%]" data-name="Vector">
        <div className="absolute inset-[-34.884%]" style={{ "--stroke-0": "rgba(115, 115, 115, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <path d="M1.93333 0.5L0.5 1.93333" id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/2 left-[12.5%] right-3/4 top-1/2" data-name="Vector">
        <div className="absolute inset-[-0.5px_-25%]" style={{ "--stroke-0": "rgba(115, 115, 115, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 1">
            <path d="M2.5 0.5H0.5" id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[23.33%_67.71%_67.71%_23.33%]" data-name="Vector">
        <div className="absolute inset-[-34.884%]" style={{ "--stroke-0": "rgba(115, 115, 115, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <path d="M1.93333 1.93333L0.5 0.5" id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function NodeTitle({ title, isChecking }: { title: string; isChecking?: boolean }) {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Title">
      {isChecking ? <LoaderIcon /> : <CircleCheckIcon />}
      <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">{title}</p>
    </div>
  );
}

function NodeDescription({ lines }: { lines: string[] }) {
  return (
    <div className="relative shrink-0 w-full" data-name="Description">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[6px] items-start justify-center leading-[1.4] not-italic pl-[24px] pr-0 py-0 relative text-[#151313] text-[14px] w-full">
          {lines.map((line, i) => (
            <p key={i} className="relative shrink-0 w-full">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function Node({ title, lines, isChecking, highlighted }: { title: string; lines: string[]; isChecking?: boolean; highlighted?: boolean }) {
  return (
    <div className={`relative rounded-[12px] shrink-0 w-full transition-colors hover:bg-[#fcfafa] ${highlighted ? 'bg-[#fcfafa]' : ''}`} data-name="Node">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[6px] items-start px-[16px] py-[12px] relative w-full">
          <NodeTitle title={title} isChecking={isChecking} />
          <NodeDescription lines={lines} />
        </div>
      </div>
    </div>
  );
}

function List({ isChecking }: { isChecking: boolean }) {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="List">
      <Node title="Компьютер" lines={["192.168.1.20", "Realtek 8822CE Wireless LAN 802.11ac PCI-E NIC"]} />
      <Node title="Роутер" lines={["192.168.1.1", "ZTE H388X"]} />
      <Node title="Wi-Fi" lines={["TIM-18140471", "Сигнал отличный (-45 dBm)"]} />
      <Node title="Интернет" lines={["80.104.129.38", "Telecom Italia S.p.A.", "Turin, IT"]} isChecking={isChecking} />
    </div>
  );
}
