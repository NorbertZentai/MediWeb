/**
 * Formats a medication dose amount + unit into a display label using
 * Hungarian decimal comma formatting. Pure display helper — does not
 * calculate or suggest dosage, only formats the given data.
 *
 * @param {number} amount - the dose amount (must be a positive finite number)
 * @param {string} [unit] - the unit label (e.g. "tabletta", "ml", "db")
 * @returns {string} formatted dose label, or '' if amount is missing/non-positive
 */
export function formatDoseLabel(amount, unit) {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
        return '';
    }

    const rounded = Number(amount.toFixed(2));
    const numberLabel = String(rounded).replace('.', ',');

    return unit ? `${numberLabel} ${unit}` : numberLabel;
}
