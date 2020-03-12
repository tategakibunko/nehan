import {
  LayoutSection
} from "./public-api";

export interface ILayoutOutlineCallbacks {
  onRoot?: () => HTMLElement,
  onSection?: (section: LayoutSection) => Node,
}
