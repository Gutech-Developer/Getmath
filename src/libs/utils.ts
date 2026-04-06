// Utility function untuk class names
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// Delay function untuk testing
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Format currency
export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// Check if menu is active based on current pathname
export function isActiveMenu(menuUrl: string, currentPath: string): boolean {
  // Exact match untuk root/dashboard
  if (menuUrl === "/" && currentPath === "/") {
    return true;
  }

  // Jangan match root untuk path lain
  if (menuUrl === "/" && currentPath !== "/") {
    return false;
  }

  // Check if current path starts with menu URL
  // Contoh: menuUrl="/reports" akan match dengan "/reports/annual-report"
  return currentPath.startsWith(menuUrl);
}

export const smoothScrolltoSection = (elementId: string) => {
  if (elementId.startsWith("#")) {
    elementId = elementId.substring(1);
  }
  const element = document.getElementById(elementId);

  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - 110;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};
