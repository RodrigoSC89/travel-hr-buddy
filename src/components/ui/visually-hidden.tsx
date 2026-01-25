/**
 * Visually Hidden Component
 * Makes content invisible but accessible to screen readers
 */
import * as React from "react";

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  /** HTML tag to render (default: span) */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * VisuallyHidden renders content that is visually hidden but accessible to screen readers.
 * Use this for providing additional context that only screen reader users need.
 * 
 * @example
 * <button>
 *   <TrashIcon aria-hidden="true" />
 *   <VisuallyHidden>Delete item</VisuallyHidden>
 * </button>
 * 
 * @example
 * <table>
 *   <caption>
 *     <VisuallyHidden>Crew members summary table</VisuallyHidden>
 *   </caption>
 * </table>
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as = "span",
}) => {
  const Component = as as React.ElementType;
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
};

/**
 * Alias for VisuallyHidden - more concise name
 */
export const SrOnly = VisuallyHidden;

export default VisuallyHidden;
