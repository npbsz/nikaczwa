//Returns the current date and time in Europe/Warsaw

export function getWarsawTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts
      .filter(function (part) {
        return part.type !== 'literal';
      })
      .map(function (part) {
        return [part.type, part.value];
      })
  );

  const weekdayIndex = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return {
    day: weekdayIndex[values.weekday],
    hour: Number(values.hour),
    minute: Number(values.minute)
  };
}
