import { cn } from '@/lib/utils'

interface LogoMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function LogoMark({ size = 48, className, ...props }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('fill-foreground', className)}
      {...props}
    >
      <circle cx="24" cy="24" r="24" />
    </svg>
  )
}
