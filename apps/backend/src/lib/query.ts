export default class Query<QueryType> {
  private table: QueryType[] = [];

  push(...value: QueryType[]) {
    this.table = [...value.reverse(), ...this.table];
    return this;
  }

  pop() {
    this.table.pop();
    return this;
  }

  getTable() {
    return this.table;
  }
}
