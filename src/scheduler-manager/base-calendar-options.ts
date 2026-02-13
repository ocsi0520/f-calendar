import { CalendarOptions, ConstraintInput } from "@fullcalendar/core/index.js";

import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const BUSINESS_TIME_START = '07:00' as const;
  const BUSINESS_TIME_END = '21:00' as const;
  const BUSINESS_CONSTRAINT: ConstraintInput = {
    start: BUSINESS_TIME_START,
    end: BUSINESS_TIME_END,
  };

export const baseCalendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    slotDuration: '00:15:00', // 15-minute granularity
    eventOverlap: false,
    selectOverlap: false,
    selectable: true, // drag selection
    firstDay: 1,
    editable: true,
    weekends: true,
    allDaySlot: false,
    locale: 'HU',
    dragScroll: true,
    height: 'auto',
    slotMinTime: BUSINESS_TIME_START,
    slotMaxTime: BUSINESS_TIME_END,
    nowIndicator: true,
    // remove prev/next and title
    headerToolbar: { left: '', center: '', right: '' },
    selectConstraint: BUSINESS_CONSTRAINT,
    eventConstraint: BUSINESS_CONSTRAINT,
    selectAllow: (selectInfo) => {
      return selectInfo.start.getDay() === selectInfo.end.getDay();
    },
  };