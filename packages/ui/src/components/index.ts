import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export { cn };
export * from './Button'
export * from './Card'
export * from './Reusable'
export * from './TestBox'
export * from './Box'
export * from './WalletAndStakingPoint'
