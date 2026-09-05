import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type NavItem = {
  label: string;
  href: string;
};

type Props = {
  items: NavItem[];
  ui: {
    menuLabel: string;
    mobileDialogLabel: string;
    mobileNavLabel: string;
    closeLabel: string;
  };
};

const dialogId = "mobile-navigation";
const closeFallbackMs = 320;
type DrawerPhase = "closed" | "opening" | "open" | "closing";

export default function MobileNav({ items, ui }: Props) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [phase, setPhase] = useState<DrawerPhase>("closed");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const releaseModalRef = useRef<(() => void) | null>(null);
  const restoreFocusRef = useRef(true);
  const isMounted = phase !== "closed";
  const isInteractive = phase === "open";

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const openMenu = () => {
    if (phase !== "open") {
      restoreFocusRef.current = true;
      setPhase("opening");
    }
  };

  const finishClose = useCallback(() => {
    setPhase("closed");
    window.requestAnimationFrame(() => {
      if (restoreFocusRef.current) {
        triggerRef.current?.focus({ preventScroll: true });
      }
    });
  }, []);

  const closeMenu = useCallback((restoreFocus = true) => {
    restoreFocusRef.current = restoreFocus;
    releaseModalRef.current?.();
    if (restoreFocus) {
      triggerRef.current?.focus({ preventScroll: true });
    } else {
      document.querySelector<HTMLElement>(".desktop-nav [aria-current], .site-header .brand")?.focus({ preventScroll: true });
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase((currentPhase) => (currentPhase === "closed" || reducedMotion ? "closed" : "closing"));
  }, []);

  useEffect(() => {
    if (phase !== "opening") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setPhase("open");
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [phase]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isInteractive) {
      return;
    }

    const background = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== scrimRef.current)
      .map((element) => ({ element, wasInert: element.inert ?? false }));

    background.forEach(({ element }) => { element.inert = true; });
    closeRef.current?.focus({ preventScroll: true });

    const keepFocusInSheet = (event: FocusEvent) => {
      if (event.target instanceof Node && !sheetRef.current?.contains(event.target)) {
        closeRef.current?.focus({ preventScroll: true });
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !sheetRef.current) {
        return;
      }

      const focusable = Array.from(
        sheetRef.current.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>("button, a[href]")
      ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex >= 0);

      if (focusable.length === 0) {
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      const focusIsOutside = !sheetRef.current.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === firstElement || focusIsOutside)) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && (document.activeElement === lastElement || focusIsOutside)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", keepFocusInSheet);

    const releaseModal = () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", keepFocusInSheet);
      background.forEach(({ element, wasInert }) => { element.inert = wasInert; });
    };
    releaseModalRef.current = releaseModal;

    return () => {
      releaseModal();
      releaseModalRef.current = null;
    };
  }, [closeMenu, isInteractive]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const desktop = window.matchMedia("(min-width: 1100px)");
    const onDesktopChange = () => {
      if (desktop.matches) {
        closeMenu(false);
      }
    };

    onDesktopChange();
    desktop.addEventListener("change", onDesktopChange);
    return () => desktop.removeEventListener("change", onDesktopChange);
  }, [closeMenu, isMounted]);

  useEffect(() => {
    if (phase !== "closing") {
      return;
    }

    const timeoutId = window.setTimeout(finishClose, closeFallbackMs);

    return () => window.clearTimeout(timeoutId);
  }, [finishClose, phase]);

  return (
    <div className="mobile-nav" data-hydrated={isHydrated ? "true" : "false"}>
      <button
        ref={triggerRef}
        type="button"
        className="nav-trigger pressable"
        aria-expanded={isInteractive}
        aria-controls={dialogId}
        onClick={openMenu}
      >
        {ui.menuLabel}
      </button>

      {isMounted
        ? createPortal(
            <div
              ref={scrimRef}
              className="nav-scrim"
              data-state={isInteractive ? "open" : "closed"}
              role="presentation"
              aria-hidden={isInteractive ? undefined : true}
              inert={isInteractive ? undefined : true}
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeMenu();
                }
              }}
            >
              <div
                id={dialogId}
                ref={sheetRef}
                className="nav-sheet"
                tabIndex={-1}
                role={isInteractive ? "dialog" : undefined}
                aria-modal={isInteractive ? "true" : undefined}
                aria-label={isInteractive ? ui.mobileDialogLabel : undefined}
                onPointerDown={(event) => event.stopPropagation()}
                onTransitionEnd={(event) => {
                  if (phase === "closing" && event.target === sheetRef.current) {
                    finishClose();
                  }
                }}
              >
                <button ref={closeRef} type="button" className="nav-close pressable" onClick={() => closeMenu()}>
                  {ui.closeLabel}
                </button>
                <nav aria-label={ui.mobileNavLabel}>
                  {items.map((item) => (
                    <a key={item.href} className="pressable" data-nav-link href={item.href} onClick={() => closeMenu()}>
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
