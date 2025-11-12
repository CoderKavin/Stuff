export const parseNaturalLanguageDate = (text) => {
  const lowerText = text.toLowerCase();
  const now = new Date();

  function getNextWeekday(targetDay) {
    const d = new Date(now);
    const currentDay = d.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    d.setDate(d.getDate() + daysToAdd);
    return d;
  }

  function getDayNumber(day) {
    const days = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    return days[day.toLowerCase()];
  }

  const patterns = [
    {
      regex: /\btomorrow\b/,
      getDate: () => {
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        return d;
      },
    },
    { regex: /\btoday\b/, getDate: () => new Date(now) },
    {
      regex: /\bin (\d+) days?\b/,
      getDate: (match) => {
        const d = new Date(now);
        d.setDate(d.getDate() + parseInt(match[1]));
        return d;
      },
    },
    { regex: /\bmonday\b/, getDate: () => getNextWeekday(1) },
    { regex: /\btuesday\b/, getDate: () => getNextWeekday(2) },
    { regex: /\bwednesday\b/, getDate: () => getNextWeekday(3) },
    { regex: /\bthursday\b/, getDate: () => getNextWeekday(4) },
    { regex: /\bfriday\b/, getDate: () => getNextWeekday(5) },
    { regex: /\bsaturday\b/, getDate: () => getNextWeekday(6) },
    { regex: /\bsunday\b/, getDate: () => getNextWeekday(0) },
    {
      regex: /\bthis (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/,
      getDate: (match) => getNextWeekday(getDayNumber(match[1])),
    },
    {
      regex: /\bnext (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/,
      getDate: (match) => {
        const d = getNextWeekday(getDayNumber(match[1]));
        d.setDate(d.getDate() + 7);
        return d;
      },
    },
    {
      regex: /\bnext week\b/,
      getDate: () => {
        const d = new Date(now);
        d.setDate(d.getDate() + 7);
        return d;
      },
    },
  ];

  let date = null;
  let matchedText = null;

  for (const pattern of patterns) {
    const match = lowerText.match(pattern.regex);
    if (match) {
      date = pattern.getDate(match);
      matchedText = match[0];
      break;
    }
  }

  if (!date) return null;

  const timePatterns = [
    {
      regex: /\bat (\d{1,2}):(\d{2})\s*(am|pm)?\b/i,
      getTime: (match) => {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const meridiem = match[3]?.toLowerCase();
        if (meridiem === "pm" && hours !== 12) hours += 12;
        if (meridiem === "am" && hours === 12) hours = 0;
        return { hours, minutes, text: match[0] };
      },
    },
    {
      regex: /\bat (\d{1,2})\s*(am|pm)\b/i,
      getTime: (match) => {
        let hours = parseInt(match[1]);
        const meridiem = match[2].toLowerCase();
        if (meridiem === "pm" && hours !== 12) hours += 12;
        if (meridiem === "am" && hours === 12) hours = 0;
        return { hours, minutes: 0, text: match[0] };
      },
    },
    {
      regex: /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i,
      getTime: (match) => {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const meridiem = match[3].toLowerCase();
        if (meridiem === "pm" && hours !== 12) hours += 12;
        if (meridiem === "am" && hours === 12) hours = 0;
        return { hours, minutes, text: match[0] };
      },
    },
    {
      regex: /\b(\d{1,2})\s*(am|pm)\b/i,
      getTime: (match) => {
        let hours = parseInt(match[1]);
        const meridiem = match[2].toLowerCase();
        if (meridiem === "pm" && hours !== 12) hours += 12;
        if (meridiem === "am" && hours === 12) hours = 0;
        return { hours, minutes: 0, text: match[0] };
      },
    },
    {
      regex: /\bin the (morning|afternoon|evening|night)\b/,
      getTime: (match) => {
        const times = { morning: 9, afternoon: 14, evening: 18, night: 20 };
        return { hours: times[match[1]], minutes: 0, text: match[0] };
      },
    },
  ];

  let time = null;
  for (const pattern of timePatterns) {
    const match = lowerText.match(pattern.regex);
    if (match) {
      time = pattern.getTime(match);
      matchedText += " " + time.text;
      break;
    }
  }

  if (time) {
    date.setHours(time.hours, time.minutes, 0, 0);
  } else {
    date.setHours(9, 0, 0, 0);
  }

  return { date, matchedText: matchedText.trim() };
};
