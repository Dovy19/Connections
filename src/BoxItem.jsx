import "./BoxItem.css"

export default function BoxItem( {word, onSelect, isSelected, disabled, animateSubmission} ) {
    const handleClick = () => {
        if(!disabled) {
            onSelect(word);
        }
    };

    return (
        <div 
        className={`BoxItem ${isSelected ? "BoxItemActive" : ""} ${disabled ? "BoxItemDisabled" : ""} ${isSelected && animateSubmission ? "submit-animation" : ""}`}
        onClick={handleClick} >
            <h2 className={isSelected ? "BoxItemWordActive" : "BoxItemWord"}> {word.toUpperCase()} </h2>
        </div>
    )
}