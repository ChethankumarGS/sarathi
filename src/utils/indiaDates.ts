export const dateLabel = (d: string) => new Date(d+'T00:00:00+05:30').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'});
export function reminderTimes(deadline:string,offsets:number[],now=Date.now()){const base=Date.parse(deadline+'T09:00:00+05:30');return [...new Set(offsets)].map(n=>new Date(base-n*86400000).toISOString()).filter(d=>Date.parse(d)>now);}
export const deadlinePassed = (d:string, now=Date.now()) => now >= Date.parse(d+'T00:00:00+05:30')+86400000;
