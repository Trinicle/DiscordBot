
exports.schemaDateToDate = (date) => {
    const today = new Date(date);
    return today.toLocaleDateString();
}