import svgPaths from "./svg-gjkejt3b1w";

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

function Wrapper() {
  return (
    <div className="content-stretch flex gap-[8px] items-start justify-end relative shrink-0 w-full" data-name="Wrapper">
      <Icon />
    </div>
  );
}

function CircleCheck() {
  return (
    <div className="relative shrink-0 size-[96px]" data-name="circle-check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96 96">
        <g id="circle-check">
          <g id="Vector"></g>
          <path d={svgPaths.p19bb8c80} fill="var(--fill-0, #3CB57F)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center justify-center relative shrink-0 size-[96px]" data-name="icon">
      <CircleCheck />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.2] min-h-px min-w-px not-italic relative shrink-0 text-[36px] text-center text-neutral-950">Интернет работает</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex font-['Inter:Regular',_sans-serif] font-normal gap-[8px] items-center justify-center leading-[1.4] not-italic relative shrink-0 text-[#151313] text-[14px] text-nowrap w-full whitespace-pre" data-name="Text">
      <p className="relative shrink-0">WI-FI</p>
      <p className="relative shrink-0">TIM-18140471</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full" data-name="Text">
      <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#151313] text-[14px] text-nowrap whitespace-pre">Telecom Italia S.p.A.</p>
    </div>
  );
}

function Info() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Info">
      <Text />
      <Text1 />
      <Text2 />
    </div>
  );
}

function Top() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center min-h-px min-w-px px-0 py-[8px] relative shrink-0 w-full" data-name="Top">
      <Icon1 />
      <Info />
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

function Icon2() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center justify-center relative shrink-0 w-[16px]" data-name="icon">
      <CircleCheck1 />
    </div>
  );
}

function Text3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[16px] text-neutral-950">Защита DNS</p>
      <Icon2 />
    </div>
  );
}

function Text4() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full" data-name="Text">
      <p className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#151313] text-[14px]">Блокировка нежелательного контента включена</p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Content">
      <Text3 />
      <Text4 />
    </div>
  );
}

function Info1() {
  return (
    <div className="bg-[#fcfafa] relative rounded-[12px] shrink-0 w-full" data-name="Info">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-center px-[16px] py-[12px] relative w-full">
          <Content />
        </div>
      </div>
    </div>
  );
}

function Bottom() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-end relative shrink-0 w-full" data-name="Bottom">
      <Info1 />
    </div>
  );
}

function Wrapper1() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0 w-full" data-name="Wrapper">
      <Top />
      <Bottom />
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

function Icon3() {
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

function Icon4() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <ShieldCheck />
    </div>
  );
}

function Wrench() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="wrench">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="wrench">
          <path d={svgPaths.pdf34300} id="Vector" stroke="var(--stroke-0, #ADADAD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon5() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <Wrench />
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

function Icon6() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[6px] items-center p-[4px] relative shrink-0" data-name="icon">
      <Settings />
    </div>
  );
}

function Wrapper2() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Wrapper">
      <Icon3 />
      <Icon4 />
      <Icon5 />
      <Icon6 />
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
          <Wrapper1 />
          <Wrapper2 />
        </div>
      </div>
    </div>
  );
}