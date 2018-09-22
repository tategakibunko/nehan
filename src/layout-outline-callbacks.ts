import {
  LayoutSection
} from "./public-api";

export interface LayoutOutlineCallbacks {
  onRoot?: () => HTMLElement,
  onSection?: (section: LayoutSection) => Node,
}


