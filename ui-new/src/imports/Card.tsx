import svgPaths from "./svg-gt5503apnm";

function ArrowLeft() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="arrow-left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-left">
          <path d={svgPaths.p20f4e480} id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <ArrowLeft />
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

function Icon1() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <X />
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

function CircleCheck() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="circle-check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="circle-check">
          <g id="Vector"></g>
          <path d={svgPaths.p2f18000} fill="var(--fill-0, #3CB57F)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon2() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center justify-center p-[4px] relative shrink-0 size-[20px]" data-name="icon">
      <CircleCheck />
    </div>
  );
}

function Icon3() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[6px] grow items-center justify-center min-h-px min-w-px relative shrink-0 w-[20px]" data-name="icon">
      <div className="basis-0 bg-neutral-500 grow min-h-px min-w-px shrink-0 w-px" />
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0">
      <Icon2 />
      <Icon3 />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Компьютер</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">192.168.1.20</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Realtek 8822CE Wireless LAN 802.11ac PCI-E NIC</p>
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

function Frame14() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px pb-[16px] pt-0 px-0 relative shrink-0">
      <Wrapper1 />
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame23 />
      <Frame14 />
    </div>
  );
}

function CircleCheck1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="circle-check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="circle-check">
          <g id="Vector"></g>
          <path d={svgPaths.p2f18000} fill="var(--fill-0, #3CB57F)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon4() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center justify-center p-[4px] relative shrink-0 size-[20px]" data-name="icon">
      <CircleCheck1 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[6px] grow items-center justify-center min-h-px min-w-px relative shrink-0 w-[20px]" data-name="icon">
      <div className="basis-0 bg-neutral-500 grow min-h-px min-w-px shrink-0 w-px" />
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0">
      <Icon4 />
      <Icon5 />
    </div>
  );
}

function Text3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Wi-Fi</p>
    </div>
  );
}

function Text4() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">TIM-18140471</p>
    </div>
  );
}

function Text5() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Сигнал отличный (-45 dBm)</p>
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

function Frame15() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px pb-[16px] pt-0 px-0 relative shrink-0">
      <Wrapper2 />
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame22 />
      <Frame15 />
    </div>
  );
}

function CircleCheck2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="circle-check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="circle-check">
          <g id="Vector"></g>
          <path d={svgPaths.p2f18000} fill="var(--fill-0, #3CB57F)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon6() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center justify-center p-[4px] relative shrink-0 size-[20px]" data-name="icon">
      <CircleCheck2 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[6px] grow items-center justify-center min-h-px min-w-px relative shrink-0 w-[20px]" data-name="icon">
      <div className="basis-0 bg-neutral-500 grow min-h-px min-w-px shrink-0 w-px" />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0">
      <Icon6 />
      <Icon7 />
    </div>
  );
}

function Text6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Роутер</p>
    </div>
  );
}

function Text7() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">192.168.1.1</p>
    </div>
  );
}

function Text8() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">ZTE H388X</p>
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

function Frame16() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px pb-[16px] pt-0 px-0 relative shrink-0">
      <Wrapper3 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame27 />
      <Frame16 />
    </div>
  );
}

function Loader() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="loader">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="loader">
          <g id="Vector"></g>
          <path d="M8 4V2" id="Vector_2" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p19339880} id="Vector_3" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 8H14" id="Vector_4" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p27058680} id="Vector_5" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 12V14" id="Vector_6" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.paab8c80} id="Vector_7" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 8H2" id="Vector_8" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p21f99c00} id="Vector_9" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Icon8() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center justify-center p-[4px] relative shrink-0 size-[20px]" data-name="icon">
      <Loader />
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0">
      <Icon8 />
    </div>
  );
}

function Text9() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Интернет</p>
    </div>
  );
}

function Text10() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">80.104.129.38</p>
    </div>
  );
}

function Text11() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Telecom Italia S.p.A.</p>
    </div>
  );
}

function Text12() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Turin, IT</p>
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

function Frame17() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[6px] grow items-start min-h-px min-w-px pb-[16px] pt-0 px-0 relative shrink-0">
      <Wrapper4 />
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame28 />
      <Frame17 />
    </div>
  );
}

function Frame19() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px relative shrink-0 w-full">
      <Frame25 />
      <Frame26 />
      <Frame21 />
      <Frame24 />
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

function Icon9() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <Waypoints />
    </div>
  );
}

function ShieldCheck() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="shield-check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="shield-check">
          <path d={svgPaths.p31c87d00} id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon10() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <ShieldCheck />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">
          <path d={svgPaths.p13ded500} id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3d728000} id="Vector_2" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M13.4 10.6L19 5" id="Vector_3" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon11() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <Frame />
    </div>
  );
}

function Settings() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="settings">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="settings">
          <g id="Vector"></g>
          <path d={svgPaths.p1a317300} id="Vector_2" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3697eb00} id="Vector_3" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon12() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <Settings />
    </div>
  );
}

function Wrapper5() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Wrapper">
      <Icon9 />
      <Icon10 />
      <Icon11 />
      <Icon12 />
    </div>
  );
}

export default function Card() {
  return (
    <div className="bg-white relative rounded-[12px] size-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]" />
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-center p-[16px] relative size-full">
          <Wrapper />
          <Frame19 />
          <Wrapper5 />
        </div>
      </div>
    </div>
  );
}