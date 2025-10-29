import svgPaths from "./svg-exnfuwyo3q";

function Icon() {
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
            <path d={svgPaths.p2119b800} fill="var(--fill-0, #3CB57F)" id="Vector" />
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

function Content() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center min-h-px min-w-px px-0 py-[8px] relative shrink-0 w-full" data-name="Content">
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
              <path d={svgPaths.p332a3700} id="Vector" stroke="var(--stroke-0, #3CB57F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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

function Widget() {
  return (
    <div className="bg-[#fcfafa] relative rounded-[12px] shrink-0 w-full" data-name="Widget">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-center px-[16px] py-[12px] relative w-full">
          <Content1 />
        </div>
      </div>
    </div>
  );
}

function Wrapper() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0 w-full" data-name="Wrapper">
      <Content />
      <Widget />
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

function Icon4() {
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

function Icon5() {
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

function Icon6() {
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

function Navbar() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Navbar">
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
          <Topbar />
          <Wrapper />
          <Navbar />
        </div>
      </div>
    </div>
  );
}