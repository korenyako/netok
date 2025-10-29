import svgPaths from "./svg-awoydyzf8i";

function Icon() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="arrow-left">
        <div className="absolute inset-[20.833%]" data-name="Vector">
          <div className="absolute inset-[-7.143%]" style={{ "--stroke-0": "rgba(173, 173, 173, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path d="M8 15L1 8M1 8L8 1M1 8H15" id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <div className="relative shrink-0 size-[24px]" data-name="x">
        <div className="absolute inset-1/4" data-name="Vector">
          <div className="absolute inset-[-8.333%]" style={{ "--stroke-0": "rgba(173, 173, 173, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <path d="M13 1L1 13" id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-1/4" data-name="Vector">
          <div className="absolute inset-[-8.333%]" style={{ "--stroke-0": "rgba(173, 173, 173, 1)" } as React.CSSProperties}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <path d="M1 1L13 13" id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Wrapper() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Wrapper">
      <Icon />
      <Icon1 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center justify-center p-[4px] relative shrink-0 size-[20px]" data-name="icon">
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
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0">
      <Icon2 />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Компьютер</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">192.168.1.20</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Realtek 8822CE Wireless LAN 802.11ac PCI-E NIC</p>
    </div>
  );
}

function Wrapper1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Wrapper">
      <Text />
      <Text1 />
      <Text2 />
    </div>
  );
}

function Frame() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px pb-[16px] pt-0 px-0 relative shrink-0">
      <Wrapper1 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame7 />
      <Frame />
    </div>
  );
}

function Icon3() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center justify-center p-[4px] relative shrink-0 size-[20px]" data-name="icon">
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
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0">
      <Icon3 />
    </div>
  );
}

function Text3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Wi-Fi</p>
    </div>
  );
}

function Text4() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">TIM-18140471</p>
    </div>
  );
}

function Text5() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Сигнал отличный (-45 dBm)</p>
    </div>
  );
}

function Wrapper2() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Wrapper">
      <Text3 />
      <Text4 />
      <Text5 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px pb-[16px] pt-0 px-0 relative shrink-0">
      <Wrapper2 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame6 />
      <Frame1 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center justify-center p-[4px] relative shrink-0 size-[20px]" data-name="icon">
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
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0">
      <Icon4 />
    </div>
  );
}

function Text6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Роутер</p>
    </div>
  );
}

function Text7() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">192.168.1.1</p>
    </div>
  );
}

function Text8() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">ZTE H388X</p>
    </div>
  );
}

function Wrapper3() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Wrapper">
      <Text6 />
      <Text7 />
      <Text8 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px pb-[16px] pt-0 px-0 relative shrink-0">
      <Wrapper3 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame11 />
      <Frame2 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center justify-center p-[4px] relative shrink-0 size-[20px]" data-name="icon">
      <div className="relative shrink-0 size-[16px]" data-name="loader">
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
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0">
      <Icon5 />
    </div>
  );
}

function Text9() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Medium',sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Интернет</p>
    </div>
  );
}

function Text10() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">80.104.129.38</p>
    </div>
  );
}

function Text11() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Telecom Italia S.p.A.</p>
    </div>
  );
}

function Text12() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Turin, IT</p>
    </div>
  );
}

function Wrapper4() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Wrapper">
      <Text9 />
      <Text10 />
      <Text11 />
      <Text12 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px pb-[16px] pt-0 px-0 relative shrink-0">
      <Wrapper4 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame12 />
      <Frame3 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0 w-full">
      <Frame9 />
      <Frame10 />
      <Frame5 />
      <Frame8 />
    </div>
  );
}

function Waypoints() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="waypoints">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="waypoints">
          <path d={svgPaths.p25276b80} id="Vector" stroke="var(--stroke-0, #3CB57F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon6() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <Waypoints />
    </div>
  );
}

function Icon7() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
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

function Icon8() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
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

function Icon9() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
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

function Wrapper5() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Wrapper">
      <Icon6 />
      <Icon7 />
      <Icon8 />
      <Icon9 />
    </div>
  );
}

export default function Card() {
  return (
    <div className="bg-[#fffeff] relative rounded-[12px] size-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-center p-[16px] relative size-full">
          <Wrapper />
          <Frame4 />
          <Wrapper5 />
        </div>
      </div>
    </div>
  );
}