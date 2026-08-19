export type ModuleName =
  | "dashboard"
  | "dialotel"
  | "shopify"
  | "websites"
  | "social"
  | "chairfit"
  | "voyance"
  | "ceo-ai";

export interface ModuleDefinition {
  id: ModuleName;
  label: string;
  enabled: boolean;
  version: string;
}

export class ModuleManager {
  private modules: ModuleDefinition[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      enabled: true,
      version: "1.0.0",
    },
    {
      id: "dialotel",
      label: "Dialotel",
      enabled: true,
      version: "1.0.0",
    },
    {
      id: "shopify",
      label: "Shopify",
      enabled: false,
      version: "0.1.0",
    },
    {
      id: "websites",
      label: "Sites",
      enabled: false,
      version: "0.1.0",
    },
    {
      id: "social",
      label: "Réseaux sociaux",
      enabled: false,
      version: "0.1.0",
    },
    {
      id: "chairfit",
      label: "ChairFit",
      enabled: false,
      version: "0.1.0",
    },
    {
      id: "voyance",
      label: "Klarys Voyance",
      enabled: true,
      version: "1.0.0",
    },
    {
      id: "ceo-ai",
      label: "CEO AI",
      enabled: true,
      version: "1.0.0",
    },
  ];

  getModules() {
    return this.modules;
  }

  getEnabledModules() {
    return this.modules.filter((m) => m.enabled);
  }

  enable(id: ModuleName) {
    const module = this.modules.find((m) => m.id === id);

    if (module) {
      module.enabled = true;
    }
  }

  disable(id: ModuleName) {
    const module = this.modules.find((m) => m.id === id);

    if (module) {
      module.enabled = false;
    }
  }
}

export const moduleManager = new ModuleManager();