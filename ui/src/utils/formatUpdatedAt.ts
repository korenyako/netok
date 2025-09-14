export function formatUpdatedAt(d: Date, locale: "ru" | "en") {
  if (!d) return "";
  
  const now = new Date();
  const sameDay = d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();
    
  const time = new Intl.DateTimeFormat(locale, { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit" 
  }).format(d);
  
  if (sameDay) return time;
  
  const date = new Intl.DateTimeFormat(locale, { 
    day: "2-digit", 
    month: "2-digit", 
    year: "2-digit" 
  }).format(d);
  
  return `${date} ${time}`;
}
