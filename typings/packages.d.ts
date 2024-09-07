export interface SidebarItem {
  // 名称
  name: string;

  text: string;

  link: string;
  // 目录排序值
  order?: number;
}

export interface SidebarItems {
  // 标题
  text: string;
  // 类别
  category?: string;
  // 文档链接
  link?: string;
  // 子目录
  items?: SidebarItem[];
}

export interface Packages {
  name: string;

  text?: string;

  description: string;

  manualImport?: boolean;

  documentation?: boolean;

  functions?: SidebarItems;
}
