import Element from "../objects/element";
export default class ElementManager {
  constructor(documentIDs) {
    this.children = {};
    //If we send it a list of elements, create them
    if (documentIDs.length > 0) {
      documentIDs.forEach((documentID) => {
        this.add(documentID);
      });
    }
  }
  add(documentID) {
    this.children[documentID] = new Element(documentID);
  }
  get(documentID) {
    return this.children[documentID];
  }
}
