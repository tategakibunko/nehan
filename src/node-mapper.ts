import {
  HtmlElement,
} from './public-api'

export interface NodeMapper<T> {
  visit: (element: HtmlElement) => T;
}
