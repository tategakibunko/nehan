export interface DomCallbackContext {
  selector: string,
  name: string, // callback name like '@create'
  box: any, // LogicalBox(ver<=6), ILogicalNode(ver>=7)
  dom: HTMLElement
}

