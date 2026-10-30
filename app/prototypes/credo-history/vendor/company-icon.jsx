// Adapted from Evil Rabbit's Lifeline (MIT). See LICENSE.
import { cn } from "./utils";
const registry = {};
/**
 * Map your organization ids to icon components. Call once at module
 * scope, from a module that loads before the timeline renders:
 *
 *   registerCompanyIcons({
 *     acme: { icon: AcmeIcon, sizeClassName: "h-4 w-4" },
 *   })
 *
 * Unregistered ids fall back to the name's initial in a small ring,
 * so a timeline reads cleanly before you've drawn a single logo.
 */ export function registerCompanyIcons(entries) {
    Object.assign(registry, entries);
}
export function CompanyIcon({ id, label, className }) {
    const entry = registry[id];
    if (entry) {
        const Icon = entry.icon;
        return <span className={cn("inline-flex shrink-0 items-center justify-center text-black transition-colors duration-300 dark:text-white", entry.sizeClassName ?? "h-4 w-4", className)} aria-label={label} title={label}>
        <Icon className="h-full w-full"/>
      </span>;
    }
    return <span title={label} aria-label={label} className={cn("inline-flex h-5 w-5 select-none items-center justify-center rounded-full text-[10px] font-semibold uppercase leading-none ring-1 ring-current/30", className)}>
      {label.charAt(0)}
    </span>;
}
