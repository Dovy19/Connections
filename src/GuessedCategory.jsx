import "./GuessedCategory.css";

export default function GuessedCategory ({category, words, color}) {
    return (
        <div className="guessed-group" style={{backgroundColor: color}}>
            <h2 className="guessed-category">{category}</h2>
            <div className="guessed-words">
                {words.join(", ").toUpperCase()}
            </div>
        </div>
    )
}