export default class Page<PageType> {
  public id: string;
  public table: Array<PageType> = [];

  constructor(id: string) {
    this.id = id;
  }
}
