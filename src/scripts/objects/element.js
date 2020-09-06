export default class Element {
  constructor(documentID) {
    this.documentID = documentID;
    this.document = document.getElementById(documentID);
  }
  setContent(content) {
    this.document.innerText = content;
  }
  setOnClick(onclick) {
    console.log(onclick);
    this.document.onclick = onclick;
  }
}
