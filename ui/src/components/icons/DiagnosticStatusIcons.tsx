import type { SVGProps } from 'react';

const BG_COLOR = 'hsl(var(--background))';

/** Filled circle with checkmark cutout — for "ok" status */
export function NodeOkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="-1 -1 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.5001 0.937924C11.5559 1.54752 12.4342 2.42229 13.048 3.47563C13.6619 4.52898 13.9899 5.72436 13.9998 6.94346C14.0096 8.16256 13.7009 9.36309 13.1042 10.4262C12.5075 11.4893 11.6434 12.3782 10.5976 13.0047C9.55179 13.6313 8.36046 13.9739 7.14156 13.9986C5.92265 14.0232 4.71844 13.7291 3.64813 13.1454C2.57782 12.5616 1.67853 11.7085 1.03928 10.6704C0.400028 9.63228 0.042987 8.44522 0.00350012 7.22672L0 6.99992L0.00350012 6.77312C0.0427028 5.56422 0.394488 4.3861 1.02456 3.35362C1.65463 2.32114 2.54149 1.46954 3.59867 0.881842C4.65585 0.294144 5.84727 -0.00959755 7.05679 0.000231172C8.26631 0.0100599 9.45264 0.333123 10.5001 0.937924ZM9.59502 5.10502C9.47448 4.9845 9.31411 4.9121 9.14399 4.9014C8.97387 4.89071 8.80569 4.94245 8.67101 5.04692L8.60521 5.10502L6.30008 7.40942L5.39497 6.50502L5.32917 6.44692C5.19447 6.34252 5.02632 6.29084 4.85624 6.30157C4.68616 6.3123 4.52584 6.38471 4.40534 6.50521C4.28484 6.62571 4.21243 6.78603 4.2017 6.95611C4.19097 7.12618 4.24265 7.29433 4.34705 7.42902L4.40515 7.49482L5.80517 8.89482L5.87097 8.95292C5.99374 9.04817 6.1447 9.09986 6.30008 9.09986C6.45546 9.09986 6.60642 9.04817 6.72918 8.95292L6.79498 8.89482L9.59502 6.09482L9.65312 6.02902C9.7576 5.89434 9.80934 5.72617 9.79864 5.55605C9.78795 5.38593 9.71554 5.22556 9.59502 5.10502Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Filled circle with exclamation mark — for "partial" / warning status */
export function NodeWarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="-1 -1 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="7" cy="7" r="7" fill="currentColor" />
      <path
        d="M7 3.5V8.5"
        style={{ stroke: BG_COLOR }}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="7" cy="10.5" r="0.85" style={{ fill: BG_COLOR }} />
    </svg>
  );
}

/** Filled circle with X mark — for "down" / error status */
export function NodeErrorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="-1 -1 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="7" cy="7" r="7" fill="currentColor" />
      <path
        d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5"
        style={{ stroke: BG_COLOR }}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Spinner with 8 radial lines — for "loading" status */
export function NodeLoadingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M8 4V2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.8333 5.16667L12.2667 3.73334" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8H14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.8333 10.8333L12.2667 12.2667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12V14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.16667 10.8333L3.73334 12.2667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 8H2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.16667 5.16667L3.73334 3.73334" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
