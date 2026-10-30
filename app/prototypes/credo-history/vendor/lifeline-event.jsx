// Adapted from Evil Rabbit's Lifeline (MIT). See LICENSE.
function getEventContent(event) {
    if (typeof event === "object" && !Array.isArray(event) && "text" in event) {
        return event.text;
    }
    return event;
}
export function getLifelineEventImage(event) {
    if (typeof event === "object" && !Array.isArray(event) && "image" in event) {
        return event.image;
    }
    return undefined;
}
export function getLifelineEventEffect(event) {
    if (typeof event === "object" && !Array.isArray(event) && "effect" in event) {
        return event.effect;
    }
    return undefined;
}
export function LifelineEventText({ event, className }) {
    const content = getEventContent(event);
    if (typeof content === "string") {
        return <span className={className}>{content}</span>;
    }
    return <span className={className}>
      {content.map((segment, index)=>segment.type === "link" ? <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer" className="underline decoration-zinc-400 underline-offset-2 transition-colors duration-300 group-hover:text-black group-hover:decoration-zinc-600 dark:decoration-zinc-700 dark:group-hover:text-white dark:group-hover:decoration-zinc-400">
            {segment.value}
          </a> : <span key={index}>{segment.value}</span>)}
    </span>;
}
/** Always-visible media embedded in the timeline (image.inline). */ export function LifelineEventMedia({ media, className }) {
    if (media.video) {
        return <video src={media.video} poster={media.src} autoPlay muted loop playsInline preload="metadata" aria-label={media.alt} className={className}/>;
    }
    return(// eslint-disable-next-line @next/next/no-img-element
    <img src={media.src} alt={media.alt} loading="lazy" className={className}/>);
}
export function getLifelineEventKey(event, index) {
    const content = getEventContent(event);
    if (typeof content === "string") return `${index}-${content}`;
    return `${index}-${content.map((segment)=>segment.value).join("")}`;
}
