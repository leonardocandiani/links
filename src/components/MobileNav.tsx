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
  const isMounted = phase !== "closed";
  const isInteractive = phase === "open";

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const openMenu = () => {
    if (phase !== "open") {
      setPhase("opening");
    }
  };

  const finishClose = useCallback(() => {
    setPhase("closed");
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  const closeMenu = useCallback(() => {
    triggerRef.current?.focus();
    setPhase((currentPhase) => (currentPhase === "closed" || currentPhase === "closing" ? currentPhase : "closing"));
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

    closeRef.current?.focus();

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

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMenu, isInteractive]);

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
        className="nav-trigger pressable material"
        aria-expanded={isInteractive}
        aria-controls={dialogId}
        onClick={openMenu}
      >
        {ui.menuLabel}
      </button>

      {isMounted
        ? createPortal(
            <div
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
                className="nav-sheet material"
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
                <button ref={closeRef} type="button" className="nav-close pressable material" onClick={closeMenu}>
                  {ui.closeLabel}
                </button>
                <nav aria-label={ui.mobileNavLabel}>
                  {items.map((item) => (
                    <a key={item.href} className="pressable" href={item.href} onClick={closeMenu}>
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
