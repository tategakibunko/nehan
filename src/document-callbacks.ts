import {
  PageReader,
  ResourceLoaderContext,
  LogicalPage
} from "./public-api";

export interface DocumentCallbacks {
  onPage?: (caller: PageReader, page: LogicalPage) => void,
  onProgressPage?: (caller: PageReader, page: LogicalPage) => void,
  onCompletePage?: (caller: PageReader, time: number) => void
  onProgressImage?: (ctx: ResourceLoaderContext) => void
  onCompleteImage?: (ctx: ResourceLoaderContext) => void
}
