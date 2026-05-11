import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      className={cn('p-3', className)}
      classNames={{
        root: 'rdp-root',
        ...classNames,
      }}
      {...props}
    />
  );
}
