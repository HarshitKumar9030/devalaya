"use client";

import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import * as Select from "@radix-ui/react-select";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
} from "lucide-react";

type InputProps = ComponentProps<"input"> & {
  label?: string;
  icon?: ReactNode;
  error?: string;
  trailing?: ReactNode;
};
export function TextInput({
  label,
  icon,
  error,
  trailing,
  className = "",
  id: provided,
  ...props
}: InputProps) {
  const generated = useId();
  const id = provided ?? generated;
  return (
    <div className={`field ${className}`} data-invalid={Boolean(error)}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className="field-surface">
        {icon && <span className="field-icon">{icon}</span>}
        <input
          {...props}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : props["aria-describedby"]}
        />
        {trailing}
      </div>
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};
export function CustomSelect({
  label,
  ariaLabel,
  value,
  onValueChange,
  options,
  placeholder = "Choose an option",
  name,
  icon,
  compact = false,
  required = false,
  disabled = false,
}: {
  label?: string;
  ariaLabel?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  name?: string;
  icon?: ReactNode;
  compact?: boolean;
  required?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [container, setContainer] = useState<HTMLElement | undefined>();
  return (
    <div className={`field custom-select ${compact ? "compact-select" : ""}`}>
      {label && (
        <label id={`${id}-label`} htmlFor={id}>
          {label}
        </label>
      )}
      <Select.Root
        value={value}
        onValueChange={onValueChange}
        name={name}
        required={required}
        disabled={disabled}
        onOpenChange={(open) => {
          if (open)
            setContainer(trigger.current?.closest("dialog") ?? undefined);
        }}
      >
        <Select.Trigger
          ref={trigger}
          id={id}
          className="select-trigger"
          aria-label={ariaLabel}
          aria-labelledby={label ? `${id}-label` : undefined}
        >
          {icon && <span className="field-icon">{icon}</span>}
          <Select.Value placeholder={placeholder} />
          <Select.Icon className="select-chevron">
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal container={container}>
          <Select.Content
            className="select-popup"
            position="popper"
            sideOffset={8}
            collisionPadding={12}
          >
            <Select.ScrollUpButton className="select-scroll">
              <ChevronUp size={15} />
            </Select.ScrollUpButton>
            <Select.Viewport className="select-options">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="select-option"
                >
                  <span className="select-option-copy">
                    <Select.ItemText>{option.label}</Select.ItemText>
                    {option.description && <small>{option.description}</small>}
                  </span>
                  <Select.ItemIndicator className="select-check">
                    <Check size={15} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="select-scroll">
              <ChevronDown size={15} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export function NumberInput({
  label,
  value,
  onValueChange,
  min = 1,
  max = 1000000,
  prefix,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  prefix?: string;
}) {
  const id = useId();
  return (
    <div className="field number-field">
      <label htmlFor={id}>{label}</label>
      <div className="field-surface">
        <button
          type="button"
          className="stepper-button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onValueChange(Math.max(min, value - 1))}
        >
          <Minus size={15} />
        </button>
        {prefix && <span className="number-prefix">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          required
          value={value}
          onChange={(e) =>
            onValueChange(e.target.value === "" ? 0 : Number(e.target.value))
          }
        />
        <button
          type="button"
          className="stepper-button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onValueChange(Math.min(max, value + 1))}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

export function DateInput({
  label,
  value,
  onValueChange,
  min,
  error,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  min: string;
  error?: string;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | undefined>();
  const selected = value ? new Date(`${value}T12:00:00`) : undefined;
  const firstDate = new Date(`${min}T00:00:00`);
  return (
    <div className="field" data-invalid={Boolean(error)}>
      <label htmlFor={id}>{label}</label>
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          if (next)
            setContainer(trigger.current?.closest("dialog") ?? undefined);
          setOpen(next);
        }}
      >
        <Popover.Trigger
          id={id}
          ref={trigger}
          className="date-trigger"
          aria-label={label}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <CalendarDays size={18} />
          <span className={value ? "" : "field-placeholder"}>
            {selected ? format(selected, "EEE, d MMM yyyy") : "Choose your day"}
          </span>
          <ChevronDown size={15} />
        </Popover.Trigger>
        <Popover.Portal container={container}>
          <Popover.Content
            className="calendar-popup"
            sideOffset={8}
            collisionPadding={12}
            align="start"
          >
            <DayPicker
              mode="single"
              selected={selected}
              defaultMonth={selected ?? firstDate}
              disabled={{ before: firstDate }}
              showOutsideDays
              onSelect={(day) => {
                if (day) {
                  onValueChange(format(day, "yyyy-MM-dd"));
                  setOpen(false);
                }
              }}
            />
            <div className="calendar-hint">A little time for what matters.</div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
