import { useState } from "react";
import "./Rules.css";

export default function Rules({ onClose }) {
    return (
        <div className="rules-overlay">
            <div className="rules-modal">
                <button className="rules-close-btn" onClick={onClose}>&times;</button>
                <section>
                    <div className="rules-intro">
                        <h2>Welcome to the Connections Game!</h2>
                        <p>Your goal is to find groups of four related words from a shuffled grid.
                        Select words that share a common theme or category and then press "Submit" to check if your guess is correct.
                        </p>
                    </div>
                    <article className="rules-htp">
                        <h2>How to Play:</h2>
                        <ul>
                            <li>Select four words that you think belong to the same category.</li>
                            <li>Click "Submit" to confirm your guess.</li>
                            <li>If your guess is correct, the group will be highlighted and move to the top of the grid.</li>
                            <li>Guess incorrectly, and you'll lose a life. Lose all your lives, and the game is over!</li>
                        </ul>
                    </article>
                    <div className="rules-tips">
                        <h2>Tips: </h2>
                        <ul>
                            <li>Use the Shuffle button to rearrange the grid if you're stuck.</li>
                            <li>Each difficulty level adds more categories and words to challenge you.</li>
                        </ul>
                        <p>Good luck, and see how many connections you can find!</p>
                    </div>
                </section>
            </div>
        </div>
    )
}