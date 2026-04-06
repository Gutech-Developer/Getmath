import { cn } from "@/libs/utils";

interface InputProps {
  placeholder?: string;
  className?: string;
  type?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;  
}

interface TextAreaProps {
  placeholder?: string;
  className?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
  rows?: number;
  showCounter?: boolean;
}

export const ContentInput = (props: InputProps) => {
  return (
    <input
      type={props.type || "text"}
      className={cn(
        "w-full border text-sm border-grey-stroke rounded-xl px-5 py-4 outline-none focus:ring-1 focus:ring-moss-stone transition-colors",
        props.className
      )}
      placeholder={props.placeholder}
      value={props.value}
      onChange={props.onChange}
    />
  );
};

export const ContentTextArea = (props: TextAreaProps) => {
  const currentLength = props.value?.length || 0;
  const maxLength = props.maxLength || 200;
  const showCounter = props.showCounter !== false;

  return (
    <div className="relative w-full">
      <textarea
        className={cn(
          "w-full border text-sm border-grey-stroke thinnest-scrollbar rounded-xl px-5 py-4 outline-none focus:ring-1 focus:ring-moss-stone transition-colors resize-none",
          props.className
        )}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
        maxLength={maxLength}
        rows={props.rows || 5}
      />
      {showCounter && (
        <div className="absolute bottom-5 left-5 text-xs text-grey pointer-events-none">
          {currentLength}/{maxLength}
        </div>
      )}
    </div>
  );
};
