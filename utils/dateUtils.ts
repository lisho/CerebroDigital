import { DayObject } from '../types'; // Add DayObject to types.ts if not implicitly defined by usage

export const daysOfWeekShort = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
export const daysOfWeekFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];


export const getDaysInMonthGrid = (year: number, month: number): DayObject[] => {
  const date = new Date(year, month, 1);
  const days: DayObject[] = [];

  // Adjust to make Monday the first day of the week (0 for Monday, 6 for Sunday)
  let firstDayOfWeekIndex = (date.getDay() + 6) % 7;

  // Add days from the previous month
  for (let i = 0; i < firstDayOfWeekIndex; i++) {
    const prevMonthDay = new Date(year, month, 0); // Last day of prev month
    prevMonthDay.setDate(prevMonthDay.getDate() - (firstDayOfWeekIndex - 1 - i));
    days.push({ date: prevMonthDay, isCurrentMonth: false, isSelected: false, isToday: false });
  }

  // Add days of the current month
  const today = new Date();
  today.setHours(0,0,0,0);

  while (date.getMonth() === month) {
    const currentDateInLoop = new Date(date);
    currentDateInLoop.setHours(0,0,0,0);
    days.push({ 
      date: currentDateInLoop, 
      isCurrentMonth: true, 
      isSelected: false, // This will be handled by the component using the grid
      isToday: currentDateInLoop.getTime() === today.getTime() 
    });
    date.setDate(date.getDate() + 1);
  }

  // Add days from the next month to fill up to typically 42 cells (6 weeks)
  // Ensure the grid always shows 6 weeks for consistent layout
  const cellsToFill = days.length <= 35 ? 35 - days.length : 42 - days.length;

  for (let i = 1; i <= cellsToFill; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false, isSelected: false, isToday: false });
  }
  
  return days.slice(0, Math.max(35, 42)); // Return 35 or 42 cells
};

export const formatDateForDisplay = (date: Date | null | string): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // Invalid date
    // For YYYY-MM-DD or full ISO strings, ensure UTC is handled if necessary to avoid off-by-one day.
    // Using toLocaleDateString is generally safer for display.
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return ''; 
  }
};

// For HTML date input (type="date"), format is YYYY-MM-DD
export const formatDateToInputString = (date: Date | null): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};


// For datetime-local inputs, format is YYYY-MM-DDTHH:mm
export const formatToDateTimeLocalString = (date: Date | string | null): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

// Parses YYYY-MM-DDTHH:mm and returns a Date object, or null if invalid
export const parseDateTimeLocalString = (dateTimeStr: string): Date | null => {
    if (!dateTimeStr) return null;
    const date = new Date(dateTimeStr);
    return isNaN(date.getTime()) ? null : date;
};

// Format full datetime for display purposes (e.g. in a text input after selection)
export const formatFullDateTimeForDisplay = (date: Date | string | null): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return '';
    }
};