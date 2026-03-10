/**
 * src/lib/base.js
 * Abstract Base Class for AI Platform scrapers.
 * This class defines the required interface for the orchestrator.
 */
export default class AIPlatform {
  /**
   * Platform-specific CSS selectors.
   * Must be overridden in the subclass.
   */
  static selectors = {
    container: '',
    timestamp: '',
    content: ''
  };

  /**
   * Detects if the current URL matches this platform.
   * @returns {boolean}
   */
  static detect() {
    throw new Error("Static method detect() must be implemented by the platform class.");
  }

  /**
   * Scrapes the DOM and returns a standardized data package.
   * @returns {Object} { conversation_id, messages: [] }
   */
  static extractMessages() {
    throw new Error("Static method extractMessages() must be implemented by the platform class.");
  }
}