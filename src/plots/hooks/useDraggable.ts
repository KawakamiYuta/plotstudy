import { useRef } from "react";

export function useDraggable(
  x: number,
  y: number,
  onMove: (x: number, y: number) => void,
  onFocus: () => void
) {
  const offset = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    offset.current = {
      dx: e.clientX - x,
      dy: e.clientY - y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onFocus();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!offset.current) return;
    onMove(
      e.clientX - offset.current.dx,
      e.clientY - offset.current.dy
    );
  };

  const onPointerUp = () => {
    offset.current = null;
  };

  return { onPointerDown, onPointerMove, onPointerUp };
}