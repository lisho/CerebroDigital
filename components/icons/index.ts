
export { default as HomeIcon } from './HomeIcon';
export { default as UserGroupIcon } from './UserGroupIcon';
export { default as CheckBadgeIcon } from './CheckBadgeIcon';
export { default as CalendarDaysIcon } from './CalendarDaysIcon';
export { default as ClipboardDocumentListIcon } from './ClipboardDocumentListIcon';
export { default as SparklesIcon } from './SparklesIcon';
export { default as BellIcon } from './BellIcon';
export { default as MagnifyingGlassIcon } from './MagnifyingGlassIcon';
export { default as PlusIcon } from './PlusIcon';
export { default as ChevronLeftIcon } from './ChevronLeftIcon';
export { default as ChevronRightIcon } from './ChevronRightIcon';
export { default as ClockIcon } from './ClockIcon';
export { default as MapPinIcon } from './MapPinIcon';
export { default as CalendarIcon } from './CalendarIcon';
export { default as ShieldCheckIcon } from './ShieldCheckIcon';
export { default as ArrowUturnLeftIcon } from './ArrowUturnLeftIcon';
export { default as PencilIcon } from './PencilIcon';
export { default as TrashIcon } from './TrashIcon';
export { default as LightbulbIcon } from './LightbulbIcon';
export { default as UsersIcon } from './UsersIcon';
export { default as TimelineIcon } from './TimelineIcon';
export { default as ChevronDownIcon } from './ChevronDownIcon';
export { default as ChevronUpIcon } from './ChevronUpIcon';
export { default as StarIcon } from './StarIcon';
export { default as BriefcaseIcon } from './BriefcaseIcon';

// Also re-export SVG components defined in other files if they are meant to be general icons
export { DocumentTextIcon } from '../Sidebar'; // Example if you want to centralize this

// For icons defined directly as components in CaseDetailView previously,
// if they are very specific, they might stay local or be moved to a 'case-specific-icons' folder.
// For this refactor, I'm assuming the ones used in caseDetailUtils are common enough.

// If DocumentTextIconSvg, ClipboardListIcon (from CaseDetailView), CalendarDaysIconSvg, InformationCircleIcon
// are intended to be globally available icons, they should be proper .tsx files in the icons folder and exported here.
// For now, caseDetailUtils will import them directly, assuming they might still be local to CaseDetailView or similar.
// For a cleaner approach, make them separate icon files.
// For example, if DocumentTextIconSvg is a general icon:
// export { default as DocumentTextIconSvg } from './DocumentTextIconSvg';
// (and you'd create that file)

// For the current state of provided files:
// The icons ClipboardListIcon, DocumentTextIconSvg, CalendarDaysIconSvg, InformationCircleIcon
// are defined as local consts in CaseDetailView. caseDetailUtils.ts will need them passed or imported.
// To make it cleaner, they should be true components.
// I will assume for now they are moved to components/icons and exported here.
// This requires creating those files. If not, caseDetailUtils will need adjustment.

// Importing the newly created icon components
// Using direct default re-export pattern
export { default as DocumentTextIconSvg } from './DocumentTextIconSvg';
export { default as ClipboardListIcon } from './ClipboardListIcon';
export { default as CalendarDaysIconSvg } from './CalendarDaysIconSvg';
export { default as InformationCircleIcon } from './InformationCircleIcon';
