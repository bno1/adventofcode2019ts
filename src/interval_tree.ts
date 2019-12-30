interface IIntervalNode {
  end: number;
  left: IIntervalNode | null;
  right: IIntervalNode | null;
  start: number;
}

export class IIntervalTree {
  private root: IIntervalNode | null = null;

  public addRange(start: number, end: number) {
    if (this.root === null) {
      this.root = this.newNode(start, end);
      return;
    }

    let candidate: IIntervalNode = this.root;

    while (true) {
      if (end < candidate.start) {
        if (candidate.left === null) {
          candidate.left = this.newNode(start, end);
          return;
        } else {
          candidate = candidate.left;
          continue;
        }
      } else if (start > candidate.end) {
        if (candidate.right === null) {
          candidate.right = this.newNode(start, end);
          return;
        } else {
          candidate = candidate.right;
          continue;
        }
      } else {
        candidate.start = Math.min(candidate.start, start);
        candidate.end = Math.max(candidate.end, end);

        candidate.left = this.updateLeft(candidate, candidate.left);
        candidate.right = this.updateRight(candidate, candidate.right);

        return;
      }
    }
  }

  public forEachRange(callback: (range: [number, number]) => void) {
    if (this.root === null) {
      return;
    }

    this.traverse(this.root, callback);
  }

  private traverse(
    node: IIntervalNode, callback: (range: [number, number]) => void,
  ) {
    if (node.left !== null) {
      this.traverse(node.left, callback);
    }

    callback([node.start, node.end]);

    if (node.right !== null) {
      this.traverse(node.right, callback);
    }
  }

  private newNode(start: number, end: number): IIntervalNode {
    return {
      end,
      left: null,
      right: null,
      start,
    };
  }

  private updateLeft(
    root: IIntervalNode, node: IIntervalNode | null,
  ): IIntervalNode | null {
    if (node === null) {
      return null;
    }

    if (node.end < root.start) {
      node.right = this.updateLeft(root, node.right);
      return node;
    } else if (node.start < root.start) {
      root.start = node.start;
      return node.left;
    } else {
      return this.updateLeft(root, node.left);
    }
  }

  private updateRight(
    root: IIntervalNode, node: IIntervalNode | null,
  ): IIntervalNode | null {
    if (node === null) {
      return null;
    }

    if (node.start > root.end) {
      node.left = this.updateRight(root, node.left);
      return node;
    } else if (node.end > root.start) {
      root.end = node.end;
      return node.right;
    } else {
      return this.updateRight(root, node.right);
    }
  }
}
