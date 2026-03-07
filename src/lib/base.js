export default class AIPlatform {
  constructor(selectors) {
    this.selectors = selectors;
  }

  extractMessages() {
    const messages = [];
    document.querySelectorAll(this.selectors.message).forEach((el) => {
      messages.push({
        role: el.classList.contains(this.selectors.user.replace(".", ""))
          ? "user"
          : "assistant",
        content: el.querySelector(this.selectors.content).innerText,
      });
    });
    return messages;
  }
}
