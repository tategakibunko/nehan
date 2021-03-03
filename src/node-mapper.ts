import {
  NehanElement,
} from './public-api'

export interface NodeMapper<T> {
  visit: (element: NehanElement) => T;
}
