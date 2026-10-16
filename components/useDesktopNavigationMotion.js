'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const CLOSED = { value: '', visualValue: 'consumer', phase: 'closed', input: 'pointer' };

/** Radix owns navigation/focus. This owns only the persistent desktop visual frame. */
export function useDesktopNavigationMotion() {
  const [state, setState] = useState(CLOSED);
  const current = useRef(CLOSED);
  const timer = useRef(null);
  const frameRef = useRef(null);
  const viewportRef = useRef(null);
  const panels = useRef(new Map());
  const publish = next => { current.current = next; setState(next); };
  const setInput = input => {
    if (input !== current.current.input) publish({ ...current.current, input });
  };
  const changeValue = value => {
    const previous = current.current;
    if (value === previous.value) return;
    clearTimeout(timer.current);
    const instant = previous.input === 'keyboard';
    const opening = previous.phase === 'closed';
    publish({
      ...previous,
      value,
      visualValue: value || previous.visualValue,
      phase: instant ? (value ? 'open' : 'closed') : value ? (opening ? 'opening' : 'switching') : 'closing',
    });
    if (!instant) {
      timer.current = setTimeout(() => {
        publish({ ...current.current, phase: current.current.value ? 'open' : 'closed' });
      }, value ? (opening ? 200 : 500) : 180);
    }
  };
  const close = () => changeValue('');

  // Measure the content, never the animating frame. Its fixed-width absolute children
  // do not reflow with the frame's height. Ref attachment also covers the first open.
  const measurePanel = useCallback(panel => {
    const viewport = viewportRef.current;
    if (!viewport || !panel) return;
    const height = Math.ceil(panel.getBoundingClientRect().height) + 1;
    if (height > 1) viewport.style.height = `${height}px`;
  }, []);
  const registerPanel = useCallback(panel => {
    if (!panel) return;
    const id = panel.dataset.panel;
    panels.current.set(id, panel);
    const measureIfSelected = () => { if (id === current.current.visualValue) measurePanel(panel); };
    measureIfSelected();
    const observer = new ResizeObserver(measureIfSelected);
    observer.observe(panel);
    return () => { observer.disconnect(); panels.current.delete(id); };
  }, [measurePanel]);
  useLayoutEffect(() => {
    measurePanel(panels.current.get(state.visualValue));
  }, [state.visualValue, state.value]);

  const presented = state.phase !== 'closed';
  useEffect(() => {
    if (!presented) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = previous; };
  }, [presented]);
  useEffect(() => {
    const compact = window.matchMedia('(max-width:1199px)');
    const closeOnCompact = () => {
      if (!compact.matches) return;
      clearTimeout(timer.current);
      publish({ ...current.current, value: '', phase: 'closed' });
    };
    compact.addEventListener('change', closeOnCompact);
    return () => { compact.removeEventListener('change', closeOnCompact); clearTimeout(timer.current); };
  }, []);

  const onKeyDownCapture = event => {
    if (!['Enter', ' ', 'Tab', 'Escape', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    setInput('keyboard');
    if (event.key === 'Escape' && current.current.value) {
      // Force-mounted inactive Radix layers cannot choose the focus-return target.
      const trigger = frameRef.current?.querySelector(`[data-nav-trigger="${current.current.value}"]`);
      event.preventDefault();
      event.stopPropagation();
      close();
      trigger?.focus({ preventScroll: true });
    }
  };
  const onPointerMoveCapture = event => { if (event.pointerType === 'mouse') setInput('pointer'); };
  useEffect(() => {
    // A hover-open menu may leave keyboard focus in the page below the header.
    const onDocumentKeyDown = event => {
      if (event.key === 'Escape' && current.current.value && !frameRef.current?.contains(event.target)) onKeyDownCapture(event);
    };
    document.addEventListener('keydown', onDocumentKeyDown, true);
    return () => document.removeEventListener('keydown', onDocumentKeyDown, true);
  }, []);

  return { ...state, presented, frameRef, viewportRef, registerPanel, changeValue, close, onKeyDownCapture, onPointerMoveCapture };
}
