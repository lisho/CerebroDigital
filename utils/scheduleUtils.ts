
import { ScheduleEvent, CreateAppointmentArgs, EventType } from '../types';
import { MOCK_SCHEDULE_EVENTS_KEY } from '../constants';

// The function addEventToScheduleFromAI is removed.
// The AI will now provide appointment details as a JSON string in its response.
// The AIChatView will parse this, store it in a context, and navigate to ScheduleView.
// ScheduleView will then use this context data to pre-fill the EventModal,
// and the user will confirm the creation through the modal.
// Saving to localStorage will be handled by the EventModal's save logic in ScheduleView.

// Utility functions for schedule manipulation can still exist here if needed by the UI,
// but direct AI invocation to add events is removed.

// Example of a utility that might still be useful (though not directly used by AI anymore):
export const createScheduleEventObject = (args: CreateAppointmentArgs): ScheduleEvent => {
  const startDate = new Date(args.startDateTime);
  const endDate = new Date(args.endDateTime);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format provided for event creation.");
  }
  if (endDate < startDate) {
    throw new Error("End date/time cannot be before start date/time.");
  }

  return {
    id: Date.now().toString(), // Temporary ID, can be updated upon saving
    title: args.title,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    description: args.description || undefined,
    type: args.eventType || EventType.Other,
    location: args.location || undefined,
    allDay: args.allDay || false,
    alertMinutesBefore: args.alertMinutesBefore ? Number(args.alertMinutesBefore) : undefined,
    alertTriggered: false,
  };
};
