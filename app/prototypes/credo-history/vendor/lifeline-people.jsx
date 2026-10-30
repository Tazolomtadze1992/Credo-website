// Adapted from Evil Rabbit's Lifeline (MIT). See LICENSE.
import Image from "next/image";
export function aggregateLifelinePeople(marker) {
    const map = new Map();
    const add = (name, type, photo)=>{
        const person = map.get(name) ?? {
            name,
            mentor: false,
            met: false
        };
        person[type] = true;
        person.photo = person.photo ?? photo;
        map.set(name, person);
    };
    marker.mentors?.forEach((person)=>add(person.name, "mentor", person.photo));
    marker.met?.forEach((person)=>add(person.name, "met", person.photo));
    return [
        ...map.values()
    ];
}
function getInitials(name) {
    return name.split(" ").filter(Boolean).map((part)=>part[0]).join("").slice(0, 2);
}
export function LifelinePeople({ people, allowWrap = false }) {
    if (people.length === 0) return null;
    return <div className="w-full space-y-3">
      {people.map((person)=><div key={person.name} className="flex w-full items-center gap-2.5">
          <div className="flex w-3 shrink-0 items-center justify-center gap-0.5">
            {person.mentor && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true"/>}
            {person.met && <span className="h-1.5 w-1.5 rounded-full bg-pink-500" aria-hidden="true"/>}
          </div>
          {person.photo ? <Image src={person.photo} alt={person.name} width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover"/> : <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white transition-colors duration-300 dark:bg-white dark:text-black">
              {getInitials(person.name)}
            </span>}
          <p className={allowWrap ? "text-left text-[13px] leading-snug text-zinc-500 transition-colors duration-300" : "whitespace-nowrap text-left text-[13px] text-zinc-500 transition-colors duration-300 group-hover:text-zinc-700 dark:group-hover:text-zinc-400"}>
            {person.name}
          </p>
        </div>)}
    </div>;
}
