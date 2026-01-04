/**
 * Text Engine for dynamic placeholder substitution
 */

/**
 * Substitutes placeholders in text with actual values.
 * @param text The text containing placeholders like {{player}}
 * @param playerName The player's name to substitute
 * @returns The text with placeholders replaced
 */
export function substituteText(text: string, playerName: string): string {
    return text.replace(/\{\{player\}\}/g, playerName);
}
