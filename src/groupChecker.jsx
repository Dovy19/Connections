export default function groupChecker(selectedWords, groups) {
    const sortedSelection = [...selectedWords].sort();
    for (let group of groups) {
        const sortedGroup = [...group].sort();
        if (sortedSelection.length === sortedGroup.length && sortedSelection.every((word, index) => word === sortedGroup[index])) {
            return true;
        }
    }
    return false;
}