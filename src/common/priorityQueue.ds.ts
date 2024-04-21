export class PriorityQueue<T> {
  private elements: T[] = [];
  constructor(private comparator: (a: T, b: T) => boolean) {}

  enqueue(element: T): void {
    this.elements.push(element);
    this.elements.sort((a, b) => (this.comparator(a, b) ? -1 : 1));
  }

  dequeue(): T {
    return this.elements.shift()!;
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }
}
